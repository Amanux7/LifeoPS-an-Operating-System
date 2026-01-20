import db from './connection';
import fs from 'fs';
import path from 'path';

async function resetDatabase() {
    console.log('🔄 Resetting Database...');
    try {
        // Drop and recreate schema to clear all tables/types
        // We use CASCADE to remove everything
        await db.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        console.log('   ✅ Schema dropped and recreated.');

        // Re-enable pgvector
        await db.query('CREATE EXTENSION IF NOT EXISTS vector;');
        console.log('   ✅ Extension pgvector verified.');

        // Read schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Execute schema
        await db.query(schemaSql);
        console.log('   ✅ Schema applied (New Dimensions: 768).');

    } catch (error) {
        console.error('❌ Reset failed:', error);
    } finally {
        await db.close();
    }
}

resetDatabase();
