import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

router.post('/', upload.single('file'), (req, res) => {
    if (req.file) {
        res.send({ filePath: `/uploads/${req/file.filename}`});
    } else {
        res.status(500).send({ error: 'File uploadd failed' });
    }
});

export default router;