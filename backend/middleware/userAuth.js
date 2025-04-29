const jwt = require('jsonwebtoken');

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  // Check if the token is present in cookies
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Login again. No token provided.'
    });
  }

  try {
    // Verify the token
    const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (tokenDecoded.id) {
      // Attach user ID to the request object for use in subsequent middleware or route handlers
      req.body.userId = tokenDecoded.id;
      return next(); // Proceed to the next middleware or route handler
    } else {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Login again.'
      });
    }
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Token verification error:', error.message);

    // Send a generic message to the client without exposing error details
    return res.status(403).json({
      success: false,
      message: 'Token is invalid or expired.'
    });
  }
};

module.exports = userAuth;
