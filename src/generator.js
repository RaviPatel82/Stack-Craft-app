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

function failWithConfigError(message, details = []) {
    console.error(chalk.red("\n🚨 Project generation failed.\n"));
    console.error(chalk.yellow(message));

    for (const detail of details) {
        console.error(chalk.gray(`- ${detail}`));
    }

    console.error(chalk.gray("\nPlease update your stack selection "));
    process.exit(1);
}

function assertPathExists(targetPath, errorMessage, details = []) {
    if (!fs.existsSync(targetPath)) {
        failWithConfigError(errorMessage, details);
    }
}

// 🔹 Decide template name
function getTemplateName(backend, language) {
    if (backend === "NestJS" && language === "JavaScript") {
        failWithConfigError("NestJS with JavaScript is not supported.", [
            'Choose "NestJS + TypeScript", or switch to "Express + JavaScript".',
        ]);
    }

    const lang = language === "TypeScript" ? "ts" : "js";

    if (backend === "Express") return `express-${lang}`;
    if (backend === "NestJS") return `nest-${lang}`;

    failWithConfigError("Unsupported backend stack selected.", [
        `Backend: ${backend}`,
        `Language: ${language}`,
        "Supported backends: Express, NestJS",
    ]);
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
    const { projectName, prettier, backend, language, database, auth } =
        answers;

    const projectPath = path.join(process.cwd(), projectName);

    // Check if folder exists
    if (fs.existsSync(projectPath)) {
        console.log("❌ Folder already exists. Choose another name.");
        process.exit(1);
    }

    // 📦 Select template
    const templateName = getTemplateName(backend, language);
    const templatePath = path.join(__dirname, `../templates/${templateName}`);

    assertPathExists(
        templatePath,
        `Base template "${templateName}" is missing.`,
        [
            `Expected path: templates/${templateName}`,
            "This is likely a project configuration or packaging issue.",
        ],
    );

    console.log(chalk.cyan("\n🚀 Creating your project...\n"));

    // 📁 Copy template
    await fs.copy(templatePath, projectPath);

    //Copy DB templates
    if (database === "MongoDB") {
        const dbTemplate = path.join(
            __dirname,
            "../templates/features/db-mongo",
        );
        assertPathExists(
            dbTemplate,
            'Database template "db-mongo" is missing.',
            ["Expected path: templates/features/db-mongo"],
        );
        await fs.copy(dbTemplate, path.join(projectPath, "src"));
    }

    if (database === "PostgreSQL") {
        const dbTemplate = path.join(
            __dirname,
            "../templates/features/db-postgres",
        );
        assertPathExists(
            dbTemplate,
            'Database template "db-postgres" is missing.',
            ["Expected path: templates/features/db-postgres"],
        );
        await fs.copy(dbTemplate, path.join(projectPath, "src"));
    }
    // 🔐 Add auth feature if selected
    if (auth && backend === "Express") {
        const authTemplatePath = path.join(
            __dirname,
            "../templates/features/auth-js",
        );
        assertPathExists(
            authTemplatePath,
            'Auth template "auth-js" is missing.',
            ["Expected path: templates/features/auth-js"],
        );

        const targetPath = path.join(projectPath, "src");

        await fs.copy(authTemplatePath, targetPath);
    }

    if (auth && backend === "Express") {
        const routesIndexPath = path.join(projectPath, "src/routes/index.js");

        let content = await fs.readFile(routesIndexPath, "utf-8");

        content =
            `
        const authRoutes = require('./auth.routes');
        ` + content;

        content = content.replace(
            "module.exports = router;",
            `
            router.use('/auth', authRoutes);

            module.exports = router;
`,
        );

        await fs.writeFile(routesIndexPath, content);
    }

    if (database === "MongoDB") {
        const indexPath = path.join(projectPath, "src/index.js");

        let content = await fs.readFile(indexPath, "utf-8");

        content =
            `const connectDB = require('./config/db');\nconnectDB();\n\n` +
            content;

        await fs.writeFile(indexPath, content);
    }

    if (database === "PostgreSQL") {
        const indexPath = path.join(projectPath, "src/index.js");

        let content = await fs.readFile(indexPath, "utf-8");

        content = `require('./config/db');\n\n` + content;

        await fs.writeFile(indexPath, content);
    }

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

        if (auth) {
            execSync("npm install jsonwebtoken bcryptjs", { stdio: "ignore" });
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
