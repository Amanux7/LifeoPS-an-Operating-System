import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import Table from 'cli-table3';

import memoryService from '../../services/memory';

export async function memoryCommand(userId: string) {
    console.log(chalk.cyan('\n🧠 Memory Management\n'));

    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Memory Management',
            choices: [
                { name: '➕ Add Memory', value: 'add' },
                { name: '🔍 Search Memories', value: 'search' },
                { name: '🔙 Back', value: 'back' }
            ]
        }
    ]);

    // userId passed from main loop

    if (action === 'add') {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'content',
                message: 'Memory content:',
                validate: (input) => input.length > 0
            },
            {
                type: 'list',
                name: 'type',
                message: 'Type:',
                choices: ['short_term', 'long_term']
            },
            {
                type: 'list',
                name: 'category',
                message: 'Category:',
                choices: ['interaction', 'decision', 'event', 'pattern', 'preference']
            },
            {
                type: 'input',
                name: 'tags',
                message: 'Tags (comma separated):'
            }
        ]);

        const spinner = ora('Saving memory...').start();
        try {
            await memoryService.createMemory({
                userId,
                content: answers.content,
                type: answers.type as any,
                category: answers.category as any,
                tags: answers.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0)
            });
            spinner.succeed('Memory saved!');
            console.log(boxen(chalk.green('✓ Memory successfully stored'), {
                padding: { left: 2, right: 2 },
                margin: { top: 1, bottom: 1 },
                borderStyle: 'round',
                borderColor: 'green'
            }));
        } catch (e: any) {
            if (e?.status === 429) {
                spinner.fail('Failed: OpenAI Quota Limit Exceeded.');
            } else {
                spinner.fail('Failed to save memory.');
                console.error(e);
            }
        }
    } else if (action === 'search') {
        const { query } = await inquirer.prompt([
            {
                type: 'input',
                name: 'query',
                message: 'Search query:'
            }
        ]);

        const spinner = ora('Searching...').start();
        try {
            const results = await memoryService.searchMemories({
                query,
                limit: 5
                // Note: Not filtering by userId to show memories from all sessions
            });
            spinner.stop();

            if (results.length === 0) {
                console.log(chalk.yellow('No memories found.'));
            } else {
                console.log(chalk.green(`\n✓ Found ${results.length} memories:\n`));

                const table = new Table({
                    head: [chalk.cyan('Content'), chalk.cyan('Type'), chalk.cyan('Similarity')],
                    colWidths: [60, 12, 12],
                    wordWrap: true,
                    style: {
                        head: [],
                        border: ['dim']
                    }
                });

                results.forEach(m => {
                    const similarity = (m as any).similarity;
                    const simScore = similarity !== undefined ? (similarity * 100).toFixed(0) + '%' : 'N/A';
                    table.push([
                        chalk.white(m.content.substring(0, 100) + (m.content.length > 100 ? '...' : '')),
                        chalk.gray(m.type),
                        chalk.yellow(simScore)
                    ]);
                });

                console.log(table.toString());
            }
        } catch (e: any) {
            spinner.stop();
            if (e?.status === 429) {
                console.log(chalk.red('Search failed: OpenAI Quota Limit Exceeded.'));
            } else {
                console.error(chalk.red('Search error:'), e);
            }
        }
    }
}
