import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import boxen from 'boxen';
import chalkAnimation from 'chalk-animation';
import { chatCommand } from './commands/chat';
import { decisionCommand } from './commands/decision';
import { memoryCommand } from './commands/memory';
import { systemStatusCommand } from './commands/status';

import { v4 as uuidv4 } from 'uuid';
import db from '../database/connection';

// ...

async function main() {
    // Clear console for clean start
    console.clear();

    // ASCII Art Banner with Animation
    const banner = figlet.textSync('LifeOps OS', {
        font: 'ANSI Shadow',
        horizontalLayout: 'default'
    });

    // Animate the banner with rainbow effect
    const rainbowTitle = chalkAnimation.rainbow(banner);

    // Let animation play for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    rainbowTitle.stop(); // Stop animation

    // Display with gradient
    console.log(gradient.pastel.multiline(banner));
    console.log(chalk.dim('                    Your AI-Powered Operating System for Life\n'));

    // Persistent session user ID
    const userId = uuidv4();

    // Display session info in a box
    const sessionBox = boxen(
        chalk.cyan('Session ID: ') + chalk.white(userId),
        {
            padding: { left: 1, right: 1, top: 0, bottom: 0 },
            margin: { left: 0, right: 0, top: 1, bottom: 1 },
            borderStyle: 'round',
            borderColor: 'cyan',
            dimBorder: true
        }
    );
    console.log(sessionBox);

    // Register user in database (required for foreign key constraints)
    try {
        await db.query(
            `INSERT INTO users (id, email, name, created_at, updated_at) 
             VALUES ($1, $2, $3, NOW(), NOW())`,
            [userId, `cli.${userId}@lifeops.local`, 'CLI User']
        );
        console.log(chalk.dim('User registered in database\n'));
    } catch (err) {
        console.error(chalk.red('Failed to register session user:'), err);
        process.exit(1);
    }

    while (true) {
        const { action } = await inquirer.prompt([
            {
                type: 'rawlist',
                name: 'action',
                message: 'What would you like to do? (Type the number and press Enter)',
                choices: [
                    { name: '💬 Chat with System', value: 'chat' },
                    { name: '⚖️  Make a Decision', value: 'decision' },
                    { name: '🧠 Manage Memories', value: 'memory' },
                    { name: '📊 System Status', value: 'status' },
                    { name: '❌ Exit', value: 'exit' }
                ]
            }
        ]);

        if (action === 'exit') {
            console.log(chalk.yellow('Goodbye! 👋'));
            process.exit(0);
        }

        try {
            switch (action) {
                case 'chat':
                    await chatCommand(userId);
                    break;
                case 'decision':
                    await decisionCommand(userId);
                    break;
                case 'memory':
                    await memoryCommand(userId);
                    break;
                case 'status':
                    await systemStatusCommand();
                    break;
            }
            // ...
        } catch (error) {
            console.error(chalk.red('\nAn error occurred:'), error);
        }

        console.log('\n'); // Add spacing
    }
}

main().catch(console.error);
