const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const ora = require("ora");

// 🔹 Decide template name based on user input
function getTemplateName(backend, language) {
    const lang = language === "TypeScript" ? "ts" : "js";

    if (backend === "Express") {
        return `express-${lang}`;
    }

    if (backend === "NestJS") {
        return `nest-${lang}`;
    }

    throw new Error("Unsupported stack");
}

// 🔹 Main generator function
async function createProjectStructure(answers) {
    const { projectName, prettier, backend, language } = answers;

    const projectPath = path.join(process.cwd(), projectName);

    // ❌ Check if folder already exists
    if (fs.existsSync(projectPath)) {
        console.log("❌ Folder already exists. Choose a different name.");
        process.exit(1);
    }

    // 📦 Get template name
    const templateName = getTemplateName(backend, language);

    const templatePath = path.join(__dirname, `../templates/${templateName}`);

    // ❌ Check if template exists
    if (!fs.existsSync(templatePath)) {
        console.log(`❌ Template "${templateName}" not found`);
        process.exit(1);
    }

    console.log("\n🚀 Creating your project...\n");

    // 📁 Copy template
    await fs.copy(templatePath, projectPath);

    // 🔄 Replace placeholders in package.json
    const packageJsonPath = path.join(projectPath, "package.json");

    if (fs.existsSync(packageJsonPath)) {
        let content = await fs.readFile(packageJsonPath, "utf-8");

        content = content.replace(/__PROJECT_NAME__/g, projectName);

        await fs.writeFile(packageJsonPath, content);
    }

    // 🧹 Remove Prettier if user didn't select it
    if (!prettier) {
        await fs.remove(path.join(projectPath, ".prettierrc"));
        await fs.remove(path.join(projectPath, ".prettierignore"));
    }

    // 📦 Install dependencies
    process.chdir(projectPath);

    const spinner = ora("Installing dependencies...").start();

    try {
        // Install base deps
        execSync("npm install", { stdio: "ignore" });

        // Install Prettier if selected
        if (prettier) {
            execSync("npm install -D prettier", { stdio: "ignore" });
        }

        spinner.succeed("Project ready 🚀");
    } catch (error) {
        spinner.fail("Installation failed");
        console.error(error);
    }

    // 🎉 Final message
    console.log(`
✅ Project "${projectName}" created successfully!

👉 Next steps:
  cd ${projectName}
  npm install
  npm start
`);
}

module.exports = createProjectStructure;
