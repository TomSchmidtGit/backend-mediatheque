import { body } from 'express-validator';

export const registerValidator = [
    body('name').notEmpty().withMessage("Le nom est requis"),
    body('email').isEmail().withMessage("Email invalide"),
    body('password').isLength({ min: 6 }).withMessage("Mot de passe trop court (min 6 caractères)")
];

export const loginValidator = [
    body('email').isEmail().withMessage("Email invalide"),
    body('password').notEmpty().withMessage("Mot de passe requis")
];

export const forgotPasswordValidator = [
    body('email').isEmail().withMessage("Email invalide")
];

export const resetPasswordValidator = [
    body('token').notEmpty().withMessage("Token de réinitialisation requis"),
    body('email').isEmail().withMessage("Email invalide"),
    body('newPassword').isLength({ min: 6 }).withMessage("Le nouveau mot de passe doit contenir au moins 6 caractères")
];

export const changePasswordValidator = [
    body('currentPassword').notEmpty().withMessage("Ancien mot de passe requis"),
    body('newPassword').isLength({ min: 6 }).withMessage("Le nouveau mot de passe doit contenir au moins 6 caractères")
];