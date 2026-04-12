const fs = require("fs-extra");
const path = require("path");

async function createProjectStructure(projectName) {
    const projectPath = path.join(process.cwd(), projectName);

    // Check if folder already exists
    if (fs.existsSync(projectPath)) {
        console.log("❌ Folder already exists. Choose a different name.");
        process.exit(1);
    }

    // Create folder
    await fs.mkdir(projectPath);

    console.log(`\n📁 Project created at: ${projectPath}`);
}

module.exports = createProjectStructure;
