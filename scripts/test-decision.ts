import { v4 as uuidv4 } from 'uuid';
import db from '../database/connection';
import decisionService from '../services/decision';
import memoryService from '../services/memory';
import { SystemAgent, SYSTEM_AGENT_MANIFEST } from '../agents/system';
import agentService from '../services/agent';
import { CreateDecisionDTO } from '../types/decision';

async function testDecisionPipeline() {
    console.log('⚖️ Starting Decision Pipeline Test...\n');

    let userId: string | null = null;
    let decisionId: string | null = null;

    try {
        // 1. Setup: Create User and Agent
        console.log('1. Setup...');

        // Create User
        const email = `test.decision.${Date.now()}@example.com`;
        const userResult = await db.query(
            `INSERT INTO users (id, email, name, created_at, updated_at) 
             VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id`,
            [uuidv4(), email, 'Decision Maker']
        );
        userId = userResult[0].id; // Assuming helper returns rows
        console.log(`   ✅ User created: ${userId}`);

        // Ensure System Agent exists
        const agentRecord = await agentService.createAgent(SYSTEM_AGENT_MANIFEST);
        console.log(`   ✅ Agent ready: ${agentRecord.slug}`);

        // 2. Create Decision
        console.log('\n2. Creating Decision...');
        const decisionData: CreateDecisionDTO = {
            userId: userId!,
            question: "Is the system healthy enough for deployment?",
            metadata: { priority: 'high' }
        };
        const decision = await decisionService.createDecision(decisionData);
        decisionId = decision.id;
        console.log(`   ✅ Decision initialized: ${decision.id}`);
        console.log(`      Question: "${decision.question}"`);

        // 3. Context Assembly (Simulated)
        console.log('\n3. Assembling Context...');
        // Create a relevant memory first
        await memoryService.createMemory({
            userId: userId!,
            content: "Deployment requires all system components to be healthy.",
            type: 'short_term',
            category: 'preference'
        });

        // Search for context
        const contextMemories = await memoryService.searchMemories({
            query: decision.question,
            limit: 3
        });

        const memoryIds = contextMemories.map(m => m.id);
        const contextSummary = `Found ${memoryIds.length} relevant memories regarding deployment criteria.`;

        await decisionService.addContext(decisionId, memoryIds, contextSummary);
        console.log(`   ✅ Context added: ${memoryIds.length} memories linked.`);

        // 4. Agent Consultation
        console.log('\n4. Consulting Agents...');
        const systemAgent = new SystemAgent(agentRecord);

        // Execute Agent
        const agentInput = { command: 'health_check' };
        const agentResult = await systemAgent.run({
            userId: userId!,
            decisionId: decisionId,
            input: agentInput
        });

        // Record Execution
        await decisionService.recordAgentExecution(
            decisionId,
            systemAgent.id,
            systemAgent.name,
            agentInput,
            agentResult
        );
        console.log(`   ✅ Agent ${systemAgent.name} consulted.`);
        console.log(`      Output: ${JSON.stringify(agentResult.data)}`);

        // 5. Synthesis
        console.log('\n5. Synthesizing Decision...');
        // In a real system, an LLM would generate this based on context + agent outputs
        const synthesis = {
            recommendation: "Proceed with deployment.",
            reasoning: "System agent reports all components are healthy. User criteria for deployment are met.",
            risks: ["Network latency spike potential"],
            alternatives: ["Delay by 1 hour to monitor stability"],
            confidence: 0.95
        };

        const finalDecision = await decisionService.updateSynthesis(decisionId, synthesis);
        console.log('   ✅ Decision Synthesized!');
        console.log(`      Recommendation: ${finalDecision.synthesized_recommendation}`);
        console.log(`      Confidence: ${finalDecision.overall_confidence}`);

    } catch (error) {
        console.error('\n❌ Test Failed:', error);
    } finally {
        // Cleanup
        if (userId) {
            console.log('\n🧹 Cleaning up test data...');
            try {
                await db.query('DELETE FROM users WHERE id = $1', [userId]);
                // Decisions cascades delete
                console.log('   Cleanup complete.');
            } catch (e) {
                console.error('Cleanup failed:', e);
            }
        }
        await db.close();
    }
}

testDecisionPipeline();
