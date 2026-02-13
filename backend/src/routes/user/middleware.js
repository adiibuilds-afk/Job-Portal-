const User = require('../../models/User');

/**
 * Middleware to mock auth (Replace with real JWT/Session middleware later)
 */
const attachUser = async (req, res, next) => {
    // In production, decode JWT from req.headers.authorization
    const { email } = req.body || req.query; // Check both for flexibility
    
    // If no email, just continue as guest
    if (!email) {
        return next();
    }
    
    try {
        let user = await User.findOne({ email });
        if (!user) {
            // Auto-create for now if not found
            const defaultName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            user = await User.create({ name: defaultName, email, lastVisit: new Date() });
        } else {
            // Update last visit
            user.lastVisit = new Date();
            await user.save();
        }
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        next(); // Still continue even if DB lookup fails
    }
};

module.exports = { attachUser };
