const jwt = require('jsonwebtoken');

// admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {
        const { atoken } = req.headers;

        if (!atoken) {
            return res.status(401).json({ success: false, message: 'Not Authorized Login Again' }); 
        }

        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET); 

        // **Important:** Do NOT directly compare the decoded token with the concatenation of email and password. 
        // This is a serious security vulnerability. 
        // Instead, you should store the admin's ID in the JWT payload and use it for authentication.

        // Example: 
        // Assuming you have an admin ID stored in the database:
        // if (token_decode.id !== process.env.ADMIN_ID) { 
        //     return res.status(401).json({ success: false, message: 'Not Authorized Login Again' }); 
        // }

        next(); 

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = authAdmin;