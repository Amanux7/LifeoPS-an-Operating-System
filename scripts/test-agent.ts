import db from '../database/connection';
import agentService from '../services/agent';
import { SystemAgent, SYSTEM_AGENT_MANIFEST } from '../agents/system';
import { v4 as uuidv4 } from 'uuid';

async function testAgentSystem() {
    console.log('🤖 Starting Agent System Test...\n');

    try {
        // 1. Register the System Agent
        console.log('1. Registering System Agent...');
        const agentRecord = await agentService.createAgent(SYSTEM_AGENT_MANIFEST);
        console.log(`   ✅ Agent registered: ${agentRecord.name} (${agentRecord.slug})`);
        console.log(`      ID: ${agentRecord.id}`);

        // 2. Instantiate the agent
        console.log('\n2. Instantiating System Agent...');

        // In a real system, we might have a factory or registry to map slugs to classes
        // For this test, we allow the class to be instantiated with the record we just got
        const systemAgent = new SystemAgent(agentRecord);
        console.log(`   ✅ Agent instance created for ${systemAgent.name}`);

        // 3. Run the agent (Echo Task)
        console.log('\n3. Running "echo" command...');
        const echoResult = await systemAgent.run({
            userId: uuidv4(), // Dummy user ID for context
            input: {
                command: 'echo',
                message: 'Hello from LifeOps OS!'
            }
        });

        if (echoResult.success && echoResult.data?.message === 'Hello from LifeOps OS!') {
            console.log('   ✅ Echo successful:', echoResult.data);
        } else {
            console.log('   ❌ Echo failed:', echoResult);
        }

        // 4. Run the agent (Health Check)
        console.log('\n4. Running "health_check" command...');
        const healthResult = await systemAgent.run({
            userId: uuidv4(),
            input: {
                command: 'health_check'
            }
        });

        if (healthResult.success && healthResult.data?.status === 'healthy') {
            console.log('   ✅ Health check passed:', healthResult.data);
        } else {
            console.log('   ❌ Health check failed:', healthResult);
        }

    } catch (error) {
        console.error('\n❌ Test Failed:', error);
    } finally {
        await db.close();
    }
}

testAgentSystem();
