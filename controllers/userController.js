import User from '../models/User.js';
import { sendAccountDeactivation } from '../utils/sendMails/sendAccountDeactivation.js';
import { sendAccountReactivation } from '../utils/sendMails/sendAccountReactivation.js';

// Récupérer tous les utilisateurs (admin uniquement)
export const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        // Construire les filtres
        const filters = {};
        
        // Filtre par recherche (nom ou email)
        if (req.query.search) {
            filters.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        
        // Filtre par rôle
        if (req.query.role) {
            filters.role = req.query.role;
        }
        
        // Filtre par statut
        if (req.query.status) {
            if (req.query.status === 'active') {
                filters.actif = true;
            } else if (req.query.status === 'inactive') {
                filters.actif = false;
            }
        }
        
        // Compter le total
        const totalItems = await User.countDocuments(filters);
        
        // Récupérer les utilisateurs avec pagination
        const users = await User.find(filters)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const totalPages = Math.ceil(totalItems / limit);
        
        res.status(200).json({
            data: users,
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};


// Contrôleur pour modifier un utilisateur
export const updateUser = async (req, res) => {
    try {
        const { name, email, role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Modifier uniquement les champs envoyés
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role; // Un admin peut changer le rôle des autres utilisateurs

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Ajouter ou retirer un favori
export const toggleFavorite = async (req, res) => {
    const userId = req.user._id;
    const { mediaId } = req.body;

    if (!mediaId) {
        return res.status(400).json({ message: 'mediaId est requis' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const index = user.favorites.indexOf(mediaId);
    if (index > -1) {
        user.favorites.splice(index, 1);
        await user.save();
        return res.status(200).json({ message: 'Média retiré des favoris' });
    } else {
        user.favorites.push(mediaId);
        await user.save();
        return res.status(200).json({ message: 'Média ajouté aux favoris' });
    }
};

// Récupérer les favoris de l'utilisateur avec pagination
export const getMyFavorites = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const user = await User.findById(userId).populate({
            path: 'favorites',
            options: {
                skip,
                limit
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const totalItems = user.favorites.length;
        const totalPages = Math.ceil(totalItems / limit);

        res.status(200).json({
            data: user.favorites,
            page,
            limit,
            totalItems,
            totalPages
        });

    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des favoris", error: error.message });
    }
};

export const deactivateUser = async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
  
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
  
      if (!user.actif) {
        return res.status(400).json({ message: 'Utilisateur déjà désactivé' });
      }
  
      user.actif = false;

      // Envoyer email de désactivation
      await sendAccountDeactivation(user);

      await user.save();
  
      res.status(200).json({ message: 'Utilisateur désactivé avec succès' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  export const reactivateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        if (user.actif) return res.status(400).json({ message: 'Utilisateur déjà actif' });

        user.actif = true;
        await user.save();

        // Envoyer email de réactivation
        await sendAccountReactivation(user);

        res.status(200).json({ message: 'Utilisateur réactivé avec succès' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Désactiver son propre compte
export const deactivateMyAccount = async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({ message: 'Mot de passe requis' });
        }

        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        if (!user.actif) {
            return res.status(400).json({ message: 'Compte déjà désactivé' });
        }

        // Vérifier le mot de passe
        const isPasswordValid = await user.matchPassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Mot de passe incorrect' });
        }

        // Désactiver le compte
        user.actif = false;
        await user.save();

        // Envoyer email de désactivation
        await sendAccountDeactivation(user);

        // Supprimer tous les refresh tokens (déconnexion forcée)
        const RefreshToken = (await import('../models/RefreshToken.js')).default;
        await RefreshToken.deleteMany({ user: user._id });

        res.status(200).json({ message: 'Compte désactivé avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// Récupérer ses propres informations
export const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('favorites', 'title type author imageUrl');
        
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Récupérer un utilisateur par ID (admin uniquement)
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('favorites', 'title type author imageUrl');
        
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Modifier ses propres informations
export const updateMyProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Vérifier si l'email existe déjà (sauf pour l'utilisateur actuel)
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
            if (existingUser) {
                return res.status(400).json({ message: 'Cet email est déjà utilisé' });
            }
        }

        // Mise à jour des champs
        if (name) user.name = name;
        if (email) user.email = email;
        // Note: On ne permet pas à l'utilisateur de changer son propre rôle

        const updatedUser = await user.save();
        
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            actif: updatedUser.actif,
            createdAt: updatedUser.createdAt
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};