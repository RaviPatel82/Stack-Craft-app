#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import askQuestions from "./prompts.js";
import createProjectStructure from "./generator.js";

const program = new Command();

program
    .name("create-stack-app")
    .description(chalk.cyan("🚀 CLI to generate fullstack projects"))
    .version("1.0.0");

program
    .command("init")
    .description("Initialize a new project")
    .action(async () => {
        console.log(chalk.green("\n🚀 Welcome to StackCraft CLI\n"));

        try {
            const answers = await askQuestions();

            console.log(chalk.yellow("\n📦 Creating your project...\n"));

            await createProjectStructure(answers);

            console.log(chalk.green("\n🎉 All done! Happy coding!\n"));
        } catch (err) {
            console.log(chalk.red("❌ Something went wrong"));
            console.error(err);
        }
    });

program.parse(process.argv);

export default program;
