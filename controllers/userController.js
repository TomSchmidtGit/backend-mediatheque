import User from '../models/User.js';

// ✅ Contrôleur pour modifier un utilisateur
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