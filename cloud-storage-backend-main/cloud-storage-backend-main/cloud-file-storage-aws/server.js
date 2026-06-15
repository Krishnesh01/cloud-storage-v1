require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const fileRoutes = require('./routes/fileRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

const requiredEnv = [
    'CLIENT_ORIGIN',
    'JWT_SECRET',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_BUCKET_NAME'
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
    console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
    if (NODE_ENV === 'production') {
        process.exit(1);
    }
}

const parseOrigins = (value) =>
    (value || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

const allowedOrigins = parseOrigins(process.env.CLIENT_ORIGIN);
const allowVercelOrigins = process.env.ALLOW_VERCEL_ORIGINS !== 'false';
const isAllowedOrigin = (origin) =>
    allowedOrigins.length === 0 ||
    allowedOrigins.includes(origin) ||
    (allowVercelOrigins && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin));

app.use(cors({
    origin(origin, callback) {
        if (!origin || isAllowedOrigin(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

const ensureDataFile = () => {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, '[]');
    }
};

const readUsers = () => {
    ensureDataFile();

    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch {
        return [];
    }
};

const writeUsers = (users) => {
    ensureDataFile();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        environment: NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

const publicUser = (user) => ({
    id: user.id,
    username: user.username
});

const createToken = (user) =>
    jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

const setAuthCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

const registerHandler = async (req, res, next) => {
    try {
        const username = String(req.body.username || '').trim();
        const password = String(req.body.password || '');

        if (!username || !password) {
            return res.status(400).json({ msg: 'Username and password are required' });
        }

        const users = readUsers();
        const existingUser = users.find(
            (user) => user.username.toLowerCase() === username.toLowerCase()
        );

        if (existingUser) {
            return res.status(409).json({ msg: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = {
            id: cryptoRandomId(),
            username,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        users.push(user);

        writeUsers(users);
        const token = createToken(user);
        setAuthCookie(res, token);

        return res.status(201).json({
            msg: 'User registered successfully',
            token,
            user: publicUser(user)
        });
    } catch (error) {
        return next(error);
    }
};

const loginHandler = async (req, res, next) => {
    try {
        const username = String(req.body.username || '').trim();
        const password = String(req.body.password || '');

        if (!username || !password) {
            return res.status(400).json({ msg: 'Username and password are required' });
        }

        const user = readUsers().find(
            (item) => item.username.toLowerCase() === username.toLowerCase()
        );

        if (!user) {
            return res.status(401).json({ msg: 'Invalid username or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ msg: 'Invalid username or password' });
        }

        const token = createToken(user);
        setAuthCookie(res, token);

        return res.json({
            token,
            user: publicUser(user)
        });
    } catch (error) {
        return next(error);
    }
};

app.post('/api/auth/register', registerHandler);
app.post('/api/auth/login', loginHandler);
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.json({ msg: 'Logged out successfully' });
});
app.post('/register', registerHandler);
app.post('/login', loginHandler);

app.use('/api/files', fileRoutes);

app.use((req, res) => {
    res.status(404).json({ msg: 'Route not found' });
});

app.use((error, req, res, next) => {
    if (error.message && error.message.startsWith('CORS blocked origin')) {
        return res.status(403).json({ msg: error.message });
    }

    console.error(error);
    return res.status(error.status || 500).json({
        msg: NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
});

function cryptoRandomId() {
    return require('crypto').randomBytes(16).toString('hex');
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
});
