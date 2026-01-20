import inquirer from 'inquirer';
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';
import { SystemAgent, SYSTEM_AGENT_MANIFEST } from '../../agents/system';
import agentService from '../../services/agent';

export async function chatCommand() {
    console.log(chalk.cyan('💬 Starting chat session with System Agent...'));
    console.log(chalk.gray('(Type "exit" to return to menu)'));

    // Ensure system agent is ready
    let agentRecord = await agentService.getAgentBySlug(SYSTEM_AGENT_MANIFEST.slug);
    if (!agentRecord) {
        agentRecord = await agentService.createAgent(SYSTEM_AGENT_MANIFEST);
    }
    const systemAgent = new SystemAgent(agentRecord);
    const userId = uuidv4(); // Temporary session user

    while (true) {
        const { message } = await inquirer.prompt([
            {
                type: 'input',
                name: 'message',
                message: chalk.green('You:'),
            }
        ]);

        if (!message) {
            continue;
        }

        if (message.toLowerCase() === 'exit') {
            break;
        }

        try {
            // For now, mapping chat to "echo" command if not specific
            // In a real system, we'd have a 'chat' capability or use an LLM router
            const input = message.trim().startsWith('/')
                ? { command: message.trim().substring(1) } // Slash commands
                : { command: 'chat', message };

            const result = await systemAgent.run({
                userId,
                input
            });

            if (result.success) {
                console.log(chalk.blue('System:'), JSON.stringify(result.data, null, 2));
            } else {
                console.log(chalk.red('System Error:'), result.error);
            }
        } catch (error) {
            console.error(chalk.red('Error:'), error);
        }
    }
}
