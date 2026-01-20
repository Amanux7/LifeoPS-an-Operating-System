import { SystemAgent, SYSTEM_AGENT_MANIFEST } from '../agents/system';
import agentService from '../services/agent';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/connection';

async function verifyChat() {
    console.log('🧪 Verifying Chat System with New Key...');
    try {
        // Ensure agent exists
        let agentRecord = await agentService.getAgentBySlug(SYSTEM_AGENT_MANIFEST.slug);
        if (!agentRecord) {
            console.log('Creating System Agent...');
            agentRecord = await agentService.createAgent(SYSTEM_AGENT_MANIFEST);
        }

        const agent = new SystemAgent(agentRecord);
        console.log('Sending message to SystemAgent (Gemini 1.5 Flash)...');

        const result = await agent.run({
            userId: uuidv4(),
            input: { command: 'chat', message: 'Hello! Are you operational?' }
        });

        if (result.success) {
            console.log('\n✅ Chat Success!');
            console.log('Response:', result.data.message);
        } else {
            console.error('\n❌ Chat Failed:', result.error);
        }
    } catch (error) {
        console.error('\n❌ Runtime Error:', error);
    } finally {
        await db.close();
    }
}

verifyChat();
