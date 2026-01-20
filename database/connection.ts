import { Pool, PoolClient, QueryResult } from 'pg';
import config from '../config';

class Database {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            connectionString: config.database.url,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        this.pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });
    }

    async query<T = any>(text: string, params?: any[]): Promise<T[]> {
        const start = Date.now();
        const res = await this.pool.query(text, params);
        const duration = Date.now() - start;

        if (duration > 1000) {
            console.warn(`Slow query (${duration}ms): ${text.substring(0, 100)}`);
        }

        return res.rows;
    }

    async getClient(): Promise<PoolClient> {
        return this.pool.acquire();
    }

    async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
        const client = await this.getClient();

        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async close(): Promise<void> {
        await this.pool.end();
    }
}

// Singleton instance
export const db = new Database();
export default db;
