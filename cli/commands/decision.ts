import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { v4 as uuidv4 } from 'uuid';
import decisionService from '../../services/decision';
import memoryService from '../../services/memory';
import agentService from '../../services/agent';
import { SystemAgent, SYSTEM_AGENT_MANIFEST } from '../../agents/system';
import geminiService from '../../services/gemini';
import boxen from 'boxen';

export async function decisionCommand(userId: string) {
    console.log(chalk.cyan('⚖️  New Decision Process'));

    const { question } = await inquirer.prompt([
        {
            type: 'input',
            name: 'question',
            message: 'What is the decision/question?',
            validate: (input) => input.length > 5 ? true : 'Please provide a valid question.'
        }
    ]);

    // 1. Create Decision
    const spinner = ora('Initializing decision...').start();
    let decision;
    try {
        decision = await decisionService.createDecision({
            userId,
            question
        });
        spinner.succeed(`Decision created (ID: ${decision.id.substring(0, 8)}...)`);
    } catch (error) {
        spinner.fail('Failed to create decision');
        console.error(error);
        return;
    }

    // 2. Context
    let memories: any[] = []; // Fix: Declare outside try block
    spinner.start('Searching for relevant context...');
    try {
        memories = await memoryService.searchMemories({
            query: question,
            limit: 3,
            userId // Pass userId to search
        });

        if (memories.length > 0) {
            spinner.succeed(`Found ${memories.length} relevant memories.`);
            memories.forEach(m => {
                console.log(chalk.gray(`   - ${m.content.substring(0, 50)}...`));
            });
            await decisionService.addContext(decision.id, memories.map(m => m.id));
        } else {
            spinner.info('No relevant context found.');
        }
    } catch (e: any) {
        if (e?.status === 429) {
            spinner.warn('Context search skipped (OpenAI Quota Limit).');
        } else {
            spinner.fail('Context search failed');
            console.error(e);
        }
    }

    // 3. Agents
    spinner.start('Consulting System Agent...');
    try {
        let agentRecord = await agentService.getAgentBySlug(SYSTEM_AGENT_MANIFEST.slug);
        if (!agentRecord) {
            agentRecord = await agentService.createAgent(SYSTEM_AGENT_MANIFEST);
        }
        const systemAgent = new SystemAgent(agentRecord);

        // Mocking a specialized task for the decision
        const result = await systemAgent.run({
            userId,
            decisionId: decision.id,
            input: { command: 'echo', message: `Analyzing: ${question}` }
        });

        await decisionService.recordAgentExecution(
            decision.id,
            systemAgent.id,
            systemAgent.name,
            { action: 'analysis' },
            result
        );
        spinner.succeed('Agent consultation complete.');
    } catch (error) {
        spinner.fail('Agent consultation failed');
        console.error(error);
    }



    // 4. Synthesis
    spinner.start('Synthesizing recommendation...');
    try {
        const prompt = `
            You are a wise decision-making assistant.
            Question: "${question}"
            
            Context from memories:
            ${memories.map(m => `- ${m.content}`).join('\n')}
            
            Please provide a recommendation, reasoning, risks, and confidence score (0-100).
            Format as JSON: { "recommendation": "...", "reasoning": "...", "risks": "...", "confidence": 85 }
        `;

        const responseText = await geminiService.getCompletion(prompt);
        // Clean markdown code blocks if present
        const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const synthesis = JSON.parse(jsonStr);

        await decisionService.updateSynthesis(decision.id, {
            recommendation: synthesis.recommendation,
            reasoning: synthesis.reasoning,
            risks: [synthesis.risks], // Convert string to array
            alternatives: synthesis.alternatives ? [synthesis.alternatives] : [], // Convert string to array
            confidence: synthesis.confidence
        });

        spinner.succeed('Decision synthesized!');

        // Create beautiful boxed output
        const resultContent = `
${chalk.bold.green('✓ Recommendation:')} 
${chalk.white(synthesis.recommendation)}

${chalk.bold.blue('💡 Reasoning:')}
${chalk.gray(synthesis.reasoning)}

${chalk.bold.yellow('⚠️  Risks:')}
${chalk.gray(synthesis.risks)}

${chalk.bold.cyan('📊 Confidence:')} ${chalk.white(synthesis.confidence + '%')}
        `.trim();

        console.log('\n' + boxen(resultContent, {
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'green',
            title: chalk.bold('Decision Analysis Complete'),
            titleAlignment: 'center'
        }));

    } catch (error) {
        spinner.fail('Failed to synthesize decision');
        console.error(error);
    }

    // Pause before return
    await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Press Enter to continue...' }]);
}
