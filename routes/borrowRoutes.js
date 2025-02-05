import express from 'express';
import {
    borrowMedia,
    returnMedia,
    getUserBorrows,
    getAllBorrows
} from '../controllers/borrowController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, borrowMedia);        // Seuls les utilisateurs connectés peuvent emprunter
router.put('/:id/return', protect, returnMedia); // Seuls les utilisateurs connectés peuvent retourner un média
router.get('/user/:userId', protect, getUserBorrows);  // Seuls les utilisateurs connectés peuvent voir leurs emprunts
router.get('/', protect, adminOnly, getAllBorrows);    // Seuls les admins peuvent voir tous les emprunts

export default router;