import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.js';

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'mediatheque',
        allowed_formats: ['jpg', 'png', 'jpeg']
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        console.log("📂 Image interceptée par Multer :", file?.originalname || "Aucune image reçue");
        cb(null, true);
    }
});

export default upload;