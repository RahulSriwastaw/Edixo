import { Router } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env';
import { authenticate } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import fs from 'fs/promises';
import path from 'path';

const router = Router();
// router.use(authenticate); // Temporarily bypassed for Whiteboard uploads during development

const s3 = new S3Client({ region: env.AWS_REGION });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/image', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) throw new AppError('No file uploaded', 400);

        const ext = req.file.originalname.split('.').pop();
        const filename = `${uuidv4()}.${ext}`;
        const key = `images/${filename}`;

        // Check if AWS credentials are configured
        const isAwsConfigured = env.AWS_ACCESS_KEY_ID && 
                              env.AWS_ACCESS_KEY_ID !== 'your-aws-access-key' &&
                              env.AWS_SECRET_ACCESS_KEY &&
                              env.AWS_SECRET_ACCESS_KEY !== 'your-aws-secret-key';

        if (isAwsConfigured) {
            await s3.send(new PutObjectCommand({
                Bucket: env.AWS_S3_ASSETS_BUCKET,
                Key: key,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            }));

            const url = env.AWS_CLOUDFRONT_DOMAIN
                ? `https://${env.AWS_CLOUDFRONT_DOMAIN}/${key}`
                : `https://${env.AWS_S3_ASSETS_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

            return res.json({ success: true, data: { url, key } });
        } else {
            // Local fallback for development
            const uploadsDir = path.join(__dirname, '../../../uploads/images');
            await fs.mkdir(uploadsDir, { recursive: true });
            await fs.writeFile(path.join(uploadsDir, filename), req.file.buffer);

            const host = req.get('host');
            const protocol = req.protocol;
            const url = `${protocol}://${host}/uploads/images/${filename}`;

            return res.json({ success: true, data: { url, key: `local/${filename}` } });
        }
    } catch (err) { next(err); }
});

router.post('/pdf', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) throw new AppError('No file uploaded', 400);
        if (req.file.mimetype !== 'application/pdf') throw new AppError('Only PDF files allowed', 400);

        const key = `pdfs/${uuidv4()}.pdf`;

        await s3.send(new PutObjectCommand({
            Bucket: env.AWS_S3_PDFS_BUCKET,
            Key: key,
            Body: req.file.buffer,
            ContentType: 'application/pdf',
        }));

        res.json({ success: true, data: { key } });
    } catch (err) { next(err); }
});

export default router;
