const { Command } = require("commander");

const program = new Command();

program
    .name("Stack-Craft-app")
    .description("CLI to generate fullstack projects")
    .version("1.0.0");

program
    .command("init")
    .description("Initialize a new project")
    .action(() => {
        console.log("🚀 Creating your project...");
    });

program.parse(process.argv);
