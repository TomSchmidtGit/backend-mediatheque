import User from '../models/User.js';
import Media from '../models/Media.js';
import Borrow from '../models/Borrow.js';
import dayjs from 'dayjs';

// Obtenir les statistiques du dashboard
export const getDashboardStats = async (req, res) => {
    try {
        // Stats utilisateurs
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ actif: true });
        const inactiveUsers = await User.countDocuments({ actif: false });
        
        // Nouveaux utilisateurs ce mois
        const startOfMonth = dayjs().startOf('month').toDate();
        const newUsersThisMonth = await User.countDocuments({
            createdAt: { $gte: startOfMonth }
        });

        // Stats médias
        const totalMedia = await Media.countDocuments();
        const mediaByType = await Media.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Stats emprunts
        const activeBorrows = await Borrow.countDocuments({ status: 'borrowed' });
        const overdueBorrows = await Borrow.countDocuments({
            status: 'borrowed',
            dueDate: { $lt: new Date() }
        });
        const returnedBorrows = await Borrow.countDocuments({ status: 'returned' });

        // Médias les plus empruntés
        const topBorrowedMedia = await Borrow.aggregate([
            {
                $group: {
                    _id: '$media',
                    borrowCount: { $sum: 1 }
                }
            },
            { $sort: { borrowCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'media',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'mediaInfo'
                }
            },
            { $unwind: '$mediaInfo' },
            {
                $project: {
                    title: '$mediaInfo.title',
                    type: '$mediaInfo.type',
                    author: '$mediaInfo.author',
                    borrowCount: 1
                }
            }
        ]);

        // 5 derniers emprunts
        const recentBorrows = await Borrow.find()
            .populate('user', 'name email')
            .populate('media', 'title type')
            .sort({ borrowDate: -1 })
            .limit(5);

        // Utilisateurs les plus actifs (par nombre d'emprunts)
        const mostActiveUsers = await Borrow.aggregate([
            {
                $group: {
                    _id: '$user',
                    borrowCount: { $sum: 1 }
                }
            },
            { $sort: { borrowCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: '$userInfo' },
            {
                $project: {
                    name: '$userInfo.name',
                    email: '$userInfo.email',
                    borrowCount: 1
                }
            }
        ]);

        // Alertes
        const alerts = [];
        
        if (overdueBorrows > 0) {
            alerts.push({
                type: 'warning',
                message: `${overdueBorrows} emprunt(s) en retard`,
                priority: 'high'
            });
        }
        
        if (inactiveUsers > 0) {
            alerts.push({
                type: 'info',
                message: `${inactiveUsers} utilisateur(s) désactivé(s)`,
                priority: 'medium'
            });
        }

        // Emprunts en retard avec détails
        const overdueDetails = await Borrow.find({
            status: 'borrowed',
            dueDate: { $lt: new Date() }
        })
            .populate('user', 'name email')
            .populate('media', 'title')
            .sort({ dueDate: 1 })
            .limit(10);

        // Formatage des types de médias
        const mediaStats = {
            total: totalMedia,
            byType: {
                book: 0,
                movie: 0,
                music: 0
            }
        };

        mediaByType.forEach(item => {
            if (mediaStats.byType.hasOwnProperty(item._id)) {
                mediaStats.byType[item._id] = item.count;
            }
        });

        // Réponse finale
        res.status(200).json({
            users: {
                total: totalUsers,
                active: activeUsers,
                inactive: inactiveUsers,
                newThisMonth: newUsersThisMonth
            },
            media: mediaStats,
            borrows: {
                active: activeBorrows,
                overdue: overdueBorrows,
                returned: returnedBorrows,
                total: activeBorrows + returnedBorrows
            },
            topBorrowedMedia,
            recentBorrows: recentBorrows.map(borrow => ({
                _id: borrow._id,
                user: {
                    name: borrow.user?.name || 'N/A',
                    email: borrow.user?.email || 'N/A'
                },
                media: {
                    title: borrow.media?.title || 'N/A',
                    type: borrow.media?.type || 'N/A'
                },
                borrowDate: borrow.borrowDate,
                dueDate: borrow.dueDate,
                status: borrow.status
            })),
            mostActiveUsers,
            alerts,
            overdueDetails: overdueDetails.map(borrow => ({
                _id: borrow._id,
                user: {
                    name: borrow.user?.name || 'N/A',
                    email: borrow.user?.email || 'N/A'
                },
                media: {
                    title: borrow.media?.title || 'N/A'
                },
                dueDate: borrow.dueDate,
                daysOverdue: dayjs().diff(dayjs(borrow.dueDate), 'days')
            }))
        });

    } catch (error) {
        console.error('Erreur dashboard:', error);
        res.status(500).json({ 
            message: 'Erreur lors de la récupération des statistiques',
            error: error.message 
        });
    }
};

// Statistiques détaillées des emprunts par période
export const getBorrowStatsByPeriod = async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        const now = dayjs();
        let startDate;
        let groupFormat;

        switch (period) {
            case 'week':
                startDate = now.subtract(7, 'days').toDate();
                groupFormat = '%Y-%m-%d';
                break;
            case 'month':
                startDate = now.subtract(30, 'days').toDate();
                groupFormat = '%Y-%m-%d';
                break;
            case 'year':
                startDate = now.subtract(1, 'year').toDate();
                groupFormat = '%Y-%m';
                break;
            default:
                startDate = now.subtract(30, 'days').toDate();
                groupFormat = '%Y-%m-%d';
        }

        const borrowStats = await Borrow.aggregate([
            {
                $match: {
                    borrowDate: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: groupFormat,
                            date: '$borrowDate'
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            period,
            startDate,
            data: borrowStats
        });

    } catch (error) {
        res.status(500).json({ 
            message: 'Erreur lors de la récupération des statistiques d\'emprunts',
            error: error.message 
        });
    }
};

// Statistiques des médias par catégorie
export const getMediaStatsByCategory = async (req, res) => {
    try {
        const mediaByCategory = await Media.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $unwind: {
                    path: '$categoryInfo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: {
                        category: '$categoryInfo.name',
                        type: '$type'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.category',
                    types: {
                        $push: {
                            type: '$_id.type',
                            count: '$count'
                        }
                    },
                    total: { $sum: '$count' }
                }
            },
            { $sort: { total: -1 } }
        ]);

        res.status(200).json(mediaByCategory);

    } catch (error) {
        res.status(500).json({ 
            message: 'Erreur lors de la récupération des statistiques par catégorie',
            error: error.message 
        });
    }
};