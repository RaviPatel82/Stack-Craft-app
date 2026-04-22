import inquirer from "inquirer";

async function askQuestions() {
    const answers = await inquirer.prompt([
        {
            type: "input",
            name: "projectName",
            message: "Project name:",
            default: "my-app",
        },
        {
            type: "list",
            name: "backend",
            message: "Select backend framework:",
            choices: ["Express", "NestJS"],
        },
        {
            type: "list",
            name: "language",
            message: "Choose language:",
            choices: ["JavaScript", "TypeScript"],
        },
        {
            type: "confirm",
            name: "auth",
            message: "Add JWT authentication?",
            default: false,
        },
        {
            type: "list",
            name: "database",
            message: "Select database:",
            choices: ["MongoDB", "PostgreSQL", "None"],
        },
        {
            type: "confirm",
            name: "prettier",
            message: "Add Prettier for code formatting?",
            default: true,
        },
    ]);

    return answers;
}

export default askQuestions;
