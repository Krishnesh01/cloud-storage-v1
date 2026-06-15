const express = require('express');
const multer = require('multer');
const {
    DeleteObjectCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const auth = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: Number(process.env.MAX_FILE_SIZE_BYTES) || 25 * 1024 * 1024
    }
});

const awsRegion = process.env.AWS_REGION;

if (awsRegion && !/^[a-z]{2}-[a-z]+-\d$/.test(awsRegion)) {
    throw new Error('Invalid AWS_REGION value');
}

const s3 = new S3Client({
    region: awsRegion,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const bucketName = process.env.AWS_BUCKET_NAME;
const decodeKey = (value) => decodeURIComponent(value);

const streamToBuffer = async (stream) => {
    const chunks = [];

    for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
};

const publicObjectUrl = (key) =>
    `https://${bucketName}.s3.${awsRegion}.amazonaws.com/${encodeURIComponent(key)}`;

router.post('/upload', auth, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'File is required' });
        }

        const safeName = req.file.originalname.replace(/[\\/]/g, '-');
        const key = `${Date.now()}-${safeName}`;

        await s3.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        }));

        return res.status(201).json({
            msg: 'File uploaded successfully',
            file: {
                key,
                url: publicObjectUrl(key),
                size: req.file.size,
                contentType: req.file.mimetype
            }
        });
    } catch (error) {
        return next(error);
    }
});

router.get('/', auth, async (req, res, next) => {
    try {
        const data = await s3.send(new ListObjectsV2Command({
            Bucket: bucketName
        }));

        const files = (data.Contents || []).map((file) => ({
            key: file.Key,
            size: file.Size,
            lastModified: file.LastModified
        }));

        return res.json({ files });
    } catch (error) {
        return next(error);
    }
});

router.get('/download/:name', auth, async (req, res, next) => {
    try {
        const key = decodeKey(req.params.name);
        const object = await s3.send(new GetObjectCommand({
            Bucket: bucketName,
            Key: key
        }));
        const body = await streamToBuffer(object.Body);

        res.setHeader('Content-Type', object.ContentType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${key.replace(/"/g, '')}"`);
        return res.send(body);
    } catch (error) {
        return next(error);
    }
});

router.delete('/:name', auth, async (req, res, next) => {
    try {
        const key = decodeKey(req.params.name);

        await s3.send(new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key
        }));

        return res.json({ msg: 'File deleted successfully' });
    } catch (error) {
        return next(error);
    }
});

router.get('/stats', auth, async (req, res, next) => {
    try {
        const data = await s3.send(new ListObjectsV2Command({
            Bucket: bucketName
        }));

        const totalFiles = (data.Contents || []).length;
        const totalSize = (data.Contents || []).reduce(
            (sum, file) => sum + file.Size,
            0
        );

        return res.json({
            totalFiles,
            totalSizeBytes: totalSize,
            totalSizeMB: Number((totalSize / (1024 * 1024)).toFixed(2))
        });
    } catch (error) {
        return next(error);
    }
});

router.get('/share/:name', auth, async (req, res, next) => {
    try {
        const key = decodeKey(req.params.name);
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
            ResponseContentDisposition: 'inline'
        });
        const url = await getSignedUrl(s3, command, {
            expiresIn: Number(process.env.SIGNED_URL_EXPIRES_SECONDS) || 3600
        });

        return res.json({ url });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
