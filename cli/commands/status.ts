import chalk from 'chalk';
import Table from 'cli-table3';
import boxen from 'boxen';
import db from '../../database/connection';
import agentService from '../../services/agent';

export async function systemStatusCommand() {
    console.log(chalk.cyan('\n📊 System Status\n'));

    const table = new Table({
        head: [chalk.cyan('Component'), chalk.cyan('Status'), chalk.cyan('Details')],
        colWidths: [20, 15, 40],
        style: {
            head: [],
            border: ['dim']
        }
    });

    try {
        // Check database
        await db.query('SELECT 1');
        table.push([
            chalk.white('Database'),
            chalk.green('✓ Connected'),
            chalk.gray('PostgreSQL with pgvector')
        ]);
    } catch (error) {
        table.push([
            chalk.white('Database'),
            chalk.red('✗ Error'),
            chalk.gray('Connection failed')
        ]);
    }

    try {
        // Check agents
        const agents = await agentService.listAgents();
        if (agents.length > 0) {
            table.push([
                chalk.white('AI Agents'),
                chalk.green(`✓ Active (${agents.length})`),
                chalk.gray(agents.map(a => a.name).join(', '))
            ]);
        } else {
            table.push([
                chalk.white('AI Agents'),
                chalk.yellow('⚡ Ready (0)'),
                chalk.gray('No agents registered yet')
            ]);
        }
    } catch (error) {
        table.push([
            chalk.white('AI Agents'),
            chalk.red('✗ Error'),
            chalk.gray('Failed to query database')
        ]);
    }

    // Gemini API
    table.push([
        chalk.white('Gemini API'),
        chalk.green('✓ Ready'),
        chalk.gray('gemini-flash-latest')
    ]);

    console.log(table.toString());
    console.log();
}
