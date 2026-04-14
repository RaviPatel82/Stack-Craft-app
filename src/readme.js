import fs from "fs-extra";
import path from "path";

async function createReadme(projectPath, answers) {
    const { projectName, backend, language } = answers;

    const content = `# ${projectName}

🚀 Generated with create-stack-app

## 📦 Stack
- Backend: ${backend}
- Language: ${language}

## 📜 Scripts

\`\`\`bash
npm install
npm start
\`\`\`

## 🚀 Getting Started

\`\`\`bash
cd ${projectName}
npm install
npm start
\`\`\`

---

Happy coding! 🎉
`;

    await fs.writeFile(path.join(projectPath, "README.md"), content);
}

export default createReadme;
