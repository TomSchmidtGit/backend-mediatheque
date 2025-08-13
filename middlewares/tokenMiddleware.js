const blacklistedTokens = new Set();

export const revokeToken = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    blacklistedTokens.add(token);
  }
  res.status(200).json({ message: 'Token révoqué avec succès' });
};

export const checkTokenBlacklist = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (blacklistedTokens.has(token)) {
    return res.status(401).json({ message: 'Token expiré ou révoqué' });
  }
  next();
};
