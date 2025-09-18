const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.use(express.json());

const createSchema = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                content TEXT NOT NULL
            );
        `);
    } finally {
        client.release();
    }
};

app.get('/health', async (req, res) => {
    try {
        const client = await pool.connect();
        const dbStatus = await client.query('SELECT NOW()');
        client.release();
        res.json({
            status: 'OK',
            database: dbStatus.rows[0].now,
        });
    } catch (err) {
        res.status(500).json({ status: 'ERROR', error: err.message });
    }
});

app.get('/messages', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM messages');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/messages', async (req, res) => {
    const { content } = req.body;
    try {
        const result = await pool.query('INSERT INTO messages (content) VALUES ($1) RETURNING *', [content]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, async () => {
    await createSchema();
    console.log(`Server is running on http://localhost:${port}`);
});