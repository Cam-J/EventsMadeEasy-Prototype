import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
    console.log('Auth headers:', req.headers.authorization);
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
        return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

export default authMiddleware;

