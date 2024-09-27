const jwt = require("jsonwebtoken");

// Role-based access control middleware
module.exports = (allowedRoles = []) => {
  return (req, res, next) => {
    const token = req.header("Authorization");

    // Check if token is provided
    if (!token)
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });

    try {
      const actualToken = token.split(" ")[1]; // Extract the actual token (after Bearer)
      const decoded = jwt.verify(actualToken, process.env.JWT_SECRET); // Verify the token

      req.user = decoded; // Attach the decoded token to req.user

      // If no specific roles are required (i.e., open to all authenticated users)
      if (allowedRoles.length === 0) {
        return next(); // Allow the request to proceed
      }

      // if login_type is not found in user object than allow all routes
      if (!req.user.login_type) {
        return next();
      }

      // Check if the user's role is in the allowed roles
      if (!allowedRoles.includes(req.user.login_type)) {
        return res.status(403).json({
          error:
            "Access forbidden: You do not have permission to access this resource.",
        });
      }

      // If role matches, proceed to the next middleware or route handler
      next();
    } catch (err) {
      res.status(400).json({ error: "Invalid token" });
    }
  };
};
