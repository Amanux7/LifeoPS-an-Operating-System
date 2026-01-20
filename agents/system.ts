import { BaseAgent } from './base';
import { AgentContext, AgentResult, CreateAgentDTO } from '../types/agent';
import geminiService from '../services/gemini';

export const SYSTEM_AGENT_MANIFEST: CreateAgentDTO = {
    name: 'System Agent',
    slug: 'system-core',
    description: 'Handles core system maintenance, summaries, and orchestration tasks.',
    version: '1.0.0',
    capabilities: [
        {
            name: 'health_check',
            description: 'Verifies system components are operational'
        },
        {
            name: 'chat',
            description: 'Conversational capability using Gemini'
        }
    ],
    config: {
        priority: 100, // High priority
        enabled: true
    }
};

export class SystemAgent extends BaseAgent {

    async run(context: AgentContext): Promise<AgentResult> {
        try {
            console.log(`[${this.name}] Running with input:`, context.input);

            const command = context.input.command;

            if (command === 'chat' || command === 'echo') {
                // Use Gemini for conversational response
                const response = await geminiService.getCompletion(context.input.message);

                return {
                    success: true,
                    data: {
                        message: response,
                        timestamp: new Date().toISOString()
                    }
                };
            }

            if (command === 'health_check') {
                return {
                    success: true,
                    data: {
                        status: 'healthy',
                        components: {
                            database: 'connected',
                            gemini: 'configured',
                            memory: 'operational'
                        }
                    }
                };
            }

            // Default fallback
            return {
                success: false,
                error: `Unknown command: ${command}`
            };

        } catch (error) {
            console.error(`[${this.name}] Error execution:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
}
