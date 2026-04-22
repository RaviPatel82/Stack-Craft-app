import fs from "fs-extra";
import path from "path";

async function createEnvFile(projectPath, answers) {
    const { database } = answers;

    let content = `PORT=3000\nJWT_SECRET=your_secret_key\n`;

    // Add DB config based on selection
    if (database === "MongoDB") {
        content += `MONGO_URI=mongodb://localhost:27017/mydb\n`;
    }

    if (database === "PostgreSQL") {
        content += `DATABASE_URL=postgres://user:password@localhost:5432/mydb\n`;
    }

    await fs.writeFile(path.join(projectPath, ".env.example"), content);
}

export default createEnvFile;
