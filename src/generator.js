const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const ora = require("ora");

async function createProjectStructure(answers) {
    const { projectName, prettier } = answers;

    const projectPath = path.join(process.cwd(), projectName);

    // Check if folder already exists
    if (fs.existsSync(projectPath)) {
        console.log("❌ Folder already exists. Choose a different name.");
        process.exit(1);
    }

    // Create root folder
    await fs.mkdir(projectPath);

    // Create package.json
    const packageJson = {
        name: projectName,
        version: "1.0.0",
        main: "index.js",
        scripts: {
            start: "node index.js",
        },
    };
    await fs.writeJson(path.join(projectPath, "package.json"), packageJson, {
        spaces: 2,
    });

    // Create index.js
    const indexContent = `console.log("Hello, ${projectName}!");`;
    await fs.writeFile(path.join(projectPath, "index.js"), indexContent);

    // Create gitignore
    const gitignoreContent = `node_modules/\ndist/\n.env\n`;
    await fs.writeFile(path.join(projectPath, ".gitignore"), gitignoreContent);

    // Add pretteier if selected
    if (prettier) {
        const prettierConfig = {
            semi: true,
            singleQuote: true,
            trailingComma: "es5",
        };
        await fs.writeJson(
            path.join(projectPath, ".prettierrc"),
            prettierConfig,
            { spaces: 2 },
        );
        const prettierignore = `node_modules/\ndist/\nbuild/\n`;
        await fs.writeFile(
            path.join(projectPath, ".prettierignore"),
            prettierignore,
        );
    }

    // Move into project directory
    process.chdir(projectPath);

    // Spinner start
    const spinner = ora("Installing dependencies...").start();

    try {
        // Install base dependencies
        execSync("npm install", { stdio: "ignore" });

        // Install Prettier if selected
        if (prettier) {
            execSync("npm install -D prettier", { stdio: "ignore" });
        }

        spinner.succeed("Dependencies installed successfully!");
    } catch (error) {
        spinner.fail("Failed to install dependencies");
    }
    console.log(`\n📁 Project created at: ${projectPath}`);
}

module.exports = createProjectStructure;
