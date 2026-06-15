const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
    const authHeader = req.header('Authorization') || '';
    const [scheme, bearerToken] = authHeader.split(' ');
    const token = scheme === 'Bearer' && bearerToken
        ? bearerToken
        : req.cookies?.token;

    if (!token) {
        return res.status(401).json({ msg: 'Authentication token is required' });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        return next();
    } catch {
        return res.status(401).json({ msg: 'Invalid or expired token' });
    }
};
