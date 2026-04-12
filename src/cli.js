const { Command } = require("commander");
const askQuestions = require("./prompt");
const program = new Command();

program
    .name("Stack-Craft-app")
    .description("CLI to generate fullstack projects")
    .version("1.0.0");

program
    .command("init")
    .description("Initialize a new project")
    .action(async () => {
        const answers = await askQuestions();
        console.log("\n📦 Your selections:");
        console.log(answers);
    });

program.parse(process.argv);
