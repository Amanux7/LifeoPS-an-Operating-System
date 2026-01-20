import { v4 as uuidv4 } from 'uuid';
import db from '../database/connection';
import memoryService from '../services/memory';
import { MemoryType, MemoryCategory } from '../types/memory';

async function testMemorySystem() {
    console.log('🧪 Starting Memory System Test...\n');

    let userId: string | null = null;

    try {
        // 1. Create a dummy user for testing
        console.log('1. Creating test user...');
        const email = `test.user.${Date.now()}@example.com`;
        const userResult = await db.query(
            `INSERT INTO users (id, email, name, created_at, updated_at) 
             VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id`,
            [uuidv4(), email, 'Test User']
        );
        userId = userResult[0].id; // Assuming db.query returns rows array directly
        console.log(`   ✅ User created with ID: ${userId}`);

        // 2. Create a memory
        console.log('\n2. Creating a test memory...');
        const memoryContent = "I prefer to work in the mornings when it is quiet. It helps me focus on deep work tasks like coding and writing.";

        // Using 'long_term' as valid MemoryType and 'preference' as valid MemoryCategory
        const memory = await memoryService.createMemory({
            userId: userId!,
            content: memoryContent,
            type: 'long_term',
            category: 'preference',
            tags: ['work', 'productivity', 'preferences']
        });
        console.log(`   ✅ Memory created with ID: ${memory.id}`);
        console.log(`      Content: "${memory.content}"`);

        // 3. Search for the memory
        const searchQuery = "When is the best time for focus work?";
        console.log(`\n3. Searching for memory with query: "${searchQuery}"...`);

        const contextMemories = await memoryService.searchMemories({
            query: searchQuery,
            limit: 5,
            threshold: 0.1, // Lower threshold for testing
            userId: userId!
        });

        if (contextMemories.length > 0) {
            console.log(`   ✅ Found ${contextMemories.length} results.`);
            contextMemories.forEach((m: any) => {
                // Check if similarity exists (it's added in the query but typed loosely here)
                const sim = m.similarity !== undefined ? m.similarity.toFixed(4) : '?';
                console.log(`      - [Sim: ${sim}] ${m.content}`);
            });
        } else {
            console.log('   ❌ No relevant memories found.');
        }

    } catch (error) {
        console.error('\n❌ Test Failed:', error);
    } finally {
        // Cleanup
        if (userId) {
            console.log('\n🧹 Cleaning up test data...');
            try {
                await db.query('DELETE FROM users WHERE id = $1', [userId]);
                console.log('   User and associated memories deleted.');
            } catch (cleanupError) {
                console.error('Error during cleanup:', cleanupError);
            }
        }
        await db.close();
    }
}

testMemorySystem();
