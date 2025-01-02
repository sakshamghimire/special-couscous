import { Client } from 'pg';

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'admin',
    password: 'admin',
    database: 'nestjs-api',
    
});

export async function withConnection<T>(
    operation: (client: Client) => Promise<T>
): Promise<T> {
    try {
        await client.connect();
        await client.query('SET search_path TO tenant_t1')
        return await operation(client);
    } catch (error) {
        console.log("Received error on establishing connection", error)
        throw error
    } finally {
        await client.end()
    }
}


export async function withTransaction<T>(
    client: Client,
    operation: (client: Client) => Promise<T>
): Promise<T> {
    try {
        await client.query('BEGIN');
        const result = await operation(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
}
