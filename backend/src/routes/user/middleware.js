const User = require('../../models/User');

/**
 * Middleware to mock auth (Replace with real JWT/Session middleware later)
 */
const attachUser = async (req, res, next) => {
    // In production, decode JWT from req.headers.authorization
    const { email } = req.body || req.query; // Check both for flexibility
    if (!email) return res.status(401).json({ error: 'Unauthorized: Email required' });
    
    try {
        let user = await User.findOne({ email });
        if (!user) {
            // Auto-create for now if not found
            const defaultName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            user = await User.create({ name: defaultName, email });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Auth Middleware Error' });
    }
};

module.exports = { attachUser };
