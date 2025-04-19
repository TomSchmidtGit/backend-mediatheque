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