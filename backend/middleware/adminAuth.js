const jwt = require("jsonwebtoken");

const adminAuth = async (req, res, next) => {
  try {
    // ✅ Fetch token from cookies or Authorization header
    const adminToken = req.cookies?.adminToken || req.headers?.authorization?.split(" ")[1];

    if (!adminToken) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in as admin." });
    }

    // ✅ Verify the JWT token
    const decoded = jwt.verify(adminToken, process.env.JWT_SECRET_KEY);

    if (!decoded?.email) {
      return res.status(401).json({ success: false, message: "Invalid token. Please log in again." });
    }

    // ✅ Attach admin details to request object for later use
    req.admin = { email: decoded.email };

    next(); // ✅ Continue to next middleware/route
  } catch (error) {
    console.error("JWT Verification Error:", error);

    let message = "Unauthorized Access";
    if (error.name === "TokenExpiredError") {
      message = "Session expired. Please log in again.";
    } else if (error.name === "JsonWebTokenError") {
      message = "Invalid token. Please log in again.";
    }

    return res.status(401).json({ success: false, message });
  }
};

module.exports = adminAuth;
