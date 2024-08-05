import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configuration for multer to specify where and how files should be stored
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specifies the directory
    },
    filename: (req, file, cb) => {
        // timestamp combined with the original file extension
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

// Creates an instance of multer
const upload = multer({ storage });

router.post('/', upload.single('file'), (req, res) => {
    if (req.file) {
        res.send({ filePath: `/uploads/${req.file.filename}`});
    } else {
        res.status(500).send({ error: 'File upload failed' });
    }
});

export default router;
