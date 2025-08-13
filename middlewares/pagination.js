export const paginate =
  (defaultLimit = 10, maxLimit = 100) =>
  (req, res, next) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || defaultLimit, maxLimit);
    const skip = (page - 1) * limit;

    req.pagination = { page, limit, skip };
    next();
  };
