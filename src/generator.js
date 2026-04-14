import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import ora from "ora";
import chalk from "chalk";
import { fileURLToPath } from "url";

import createReadme from "./readme.js";
import createEnvFile from "./env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔹 Decide template name
function getTemplateName(backend, language) {
    const lang = language === "TypeScript" ? "ts" : "js";

    if (backend === "Express") return `express-${lang}`;
    if (backend === "NestJS") return `nest-${lang}`;

    throw new Error("Unsupported stack");
}

// 🔹 Replace placeholders in ALL files
async function replacePlaceholders(dir, projectName) {
    const files = await fs.readdir(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
            await replacePlaceholders(filePath, projectName);
        } else {
            const content = await fs.readFile(filePath, "utf-8");

            if (content.includes("__PROJECT_NAME__")) {
                const updated = content.replace(
                    /__PROJECT_NAME__/g,
                    projectName,
                );
                await fs.writeFile(filePath, updated);
            }
        }
    }
}

// 🔹 Main generator
async function createProjectStructure(answers) {
    const { projectName, prettier, backend, language, database } = answers;

    const projectPath = path.join(process.cwd(), projectName);

    // Check if folder exists
    if (fs.existsSync(projectPath)) {
        console.log("❌ Folder already exists. Choose another name.");
        process.exit(1);
    }

    // 📦 Select template
    const templateName = getTemplateName(backend, language);
    const templatePath = path.join(__dirname, `../templates/${templateName}`);

    if (!fs.existsSync(templatePath)) {
        console.log(`❌ Template "${templateName}" not found`);
        process.exit(1);
    }

    console.log(chalk.cyan("\n🚀 Creating your project...\n"));

    // 📁 Copy template
    await fs.copy(templatePath, projectPath);

    // 🔄 Replace placeholders everywhere
    await replacePlaceholders(projectPath, projectName);

    // 📄 Generate README
    await createReadme(projectPath, answers);

    // ⚙️ Generate env file
    await createEnvFile(projectPath, answers);

    // 🧹 Remove Prettier if not selected
    if (!prettier) {
        await fs.remove(path.join(projectPath, ".prettierrc"));
        await fs.remove(path.join(projectPath, ".prettierignore"));
    }

    // 📦 Install dependencies
    process.chdir(projectPath);

    const spinner = ora("Installing dependencies...").start();

    try {
        // Base install
        execSync("npm install", { stdio: "ignore" });

        // Database install
        if (database === "MongoDB") {
            execSync("npm install mongoose", { stdio: "ignore" });
        }

        if (database === "PostgreSQL") {
            execSync("npm install pg", { stdio: "ignore" });
        }

        // Prettier install
        if (prettier) {
            execSync("npm install -D prettier", { stdio: "ignore" });
        }

        spinner.succeed("Project ready 🚀");
    } catch (error) {
        spinner.fail("Installation failed");
        console.error(error);
    }

    // 🎉 Final message
    console.log(
        chalk.green(`
✅ Project "${projectName}" created successfully!
`),
    );

    console.log(
        chalk.blue(`
👉 Next steps:
  cd ${projectName}
  npm run dev # Start development server
  npm start # Start production server
`),
    );
}

export default createProjectStructure;
