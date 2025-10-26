
const express = require('express');
const multer = require('multer');
const amqp = require('amqplib');
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;
app.use(express.json()); // Middleware to parse JSON bodies

// --- Configuration ---
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'submission_queue';
const DLQ_NAME = 'submission_dlq';
const DLX_NAME = 'submission_dlx';
const SECRET_KEY = process.env.SECRET_KEY || 'your-super-secret-key-that-is-long-and-secure';

// --- RabbitMQ Connection ---
let channel;
async function connectRabbitMQ() {
    try {
        console.log('Connecting to RabbitMQ...');
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();

        // Declare the Dead-Letter Exchange and Queue
        await channel.assertExchange(DLX_NAME, 'direct', { durable: true });
        await channel.assertQueue(DLQ_NAME, { durable: true });
        await channel.bindQueue(DLQ_NAME, DLX_NAME, QUEUE_NAME);

        // Declare the main queue with dead-lettering configuration
        const queueArgs = {
            durable: true,
            arguments: {
                'x-dead-letter-exchange': DLX_NAME,
                'x-dead-letter-routing-key': QUEUE_NAME
            }
        };
        await channel.assertQueue(QUEUE_NAME, queueArgs);

        console.log('Successfully connected to RabbitMQ and queues are asserted.');
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error.message);
        setTimeout(connectRabbitMQ, 5000);
    }
}

// --- Database Connection ---
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// --- File Storage (Multer) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- Auth Middleware ---
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(403).send({ error: 'A token is required for authentication' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send({ error: 'Invalid Token' });
    }
    return next();
};

// --- Routes ---
app.get('/', (req, res) => {
    res.send('Ingestion API is running.');
});

// --- Auth Routes ---
app.post('/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send({ error: "Username and password are required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { rows } = await pool.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
            [username, hashedPassword]
        );

        res.status(201).json({ id: rows[0].id, username: rows[0].username });
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(409).send({ error: 'Username already exists.' });
        }
        console.error('Error during registration:', error.message);
        res.status(500).send({ error: 'An internal error occurred.' });
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send({ error: "Username and password are required" });
        }

        const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = rows[0];

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            const token = jwt.sign(
                { user_id: user.id, username },
                SECRET_KEY,
                { expiresIn: "2h" }
            );
            return res.status(200).json({ token });
        }

        res.status(401).send({ error: "Invalid credentials" });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).send({ error: 'An internal error occurred.' });
    }
});

// --- Secure Routes ---
app.post('/ingest', verifyToken, upload.single('cropImage'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ error: 'No file uploaded.' });
    }

    const { filename, path: filePath } = req.file;
    const userId = req.user.user_id;
    const { latitude, longitude, growth_stage } = req.body; // Extract new fields

    // Basic validation for new fields
    if (typeof latitude === 'undefined' || typeof longitude === 'undefined' || !growth_stage) {
        return res.status(400).send({ error: 'Latitude, longitude, and growth_stage are required.' });
    }

    console.log(`File received: ${filename} from user ${userId} at ${latitude}, ${longitude} (${growth_stage})`);

    try {
        const dbResponse = await pool.query(
            'INSERT INTO submissions (user_id, original_filename, storage_path, latitude, longitude, growth_stage, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [userId, filename, filePath, latitude, longitude, growth_stage, 'RECEIVED']
        );
        const submissionId = dbResponse.rows[0].id;
        console.log(`Submission ${submissionId} created in DB for user ${userId}.`);

        const message = { submission_id: submissionId, file_path: filePath };
        channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), { persistent: true });
        console.log(`[x] Sent message for submission ${submissionId} to queue.`);

        res.status(202).json({
            message: "Your submission has been received and is being processed.",
            submissionId: submissionId,
            statusUrl: `/status/${submissionId}`
        });

    } catch (error) {
        console.error('Error during ingestion process:', error.message);
        res.status(500).send({ error: 'An internal error occurred during submission.' });
    }
});

app.get('/status/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.user_id;

    try {
        // Verify the user owns this submission
        const { rows } = await pool.query('SELECT * FROM submissions WHERE id = $1 AND user_id = $2', [id, userId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Submission not found or you do not have permission to view it.' });
        }

        const submission = rows[0];
        const response = {
            submissionId: submission.id,
            status: submission.status,
            createdAt: submission.created_at,
        };

        if (submission.status === 'COMPLETED') {
            response.analysis = submission.analysis_result_json;
        } else if (submission.status === 'FAILED') {
            response.error = submission.analysis_result_json;
        }

        res.status(200).json(response);

    } catch (error) {
        console.error(`Error fetching status for ID ${id}:`, error.message);
        res.status(500).send({ error: 'An internal error occurred.' });
    }
});

app.listen(port, () => {
    console.log(`Ingestion API listening on port ${port}`);
    connectRabbitMQ();
});
