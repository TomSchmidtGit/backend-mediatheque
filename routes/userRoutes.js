import express from 'express';
import { updateUser } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route pour modifier un utilisateur (réservée aux admins)
router.put('/:id', protect, authorizeRoles('admin'), updateUser);

export default router;