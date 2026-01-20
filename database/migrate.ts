import fs from 'fs';
import path from 'path';
import db from './connection';

async function migrate() {
    console.log('Starting database migration...\n');

    try {
        // Read schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');

        // Execute schema
        await db.query(schema);

        console.log('✅ Database migration completed successfully!\n');

        // Check if pgvector is enabled
        const vectorCheck = await db.query(`
      SELECT * FROM pg_extension WHERE extname = 'vector';
    `);

        if (vectorCheck.length > 0) {
            console.log('✅ pgvector extension is enabled\n');
        } else {
            console.warn('⚠️  pgvector extension not found. Vector search will not work.\n');
        }

        // List all tables
        const tables = await db.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);

        console.log('📊 Created tables:');
        tables.forEach((t: any) => {
            console.log(`   - ${t.tablename}`);
        });
        console.log('');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await db.close();
    }
}

// Run migration
migrate();
