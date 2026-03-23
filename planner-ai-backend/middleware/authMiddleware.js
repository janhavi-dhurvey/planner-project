import jwt from "jsonwebtoken";

/* =========================================
   AUTH MIDDLEWARE
========================================= */

const authMiddleware = (req, res, next) => {

  try {

    /* =========================================
       CHECK AUTH HEADER
    ========================================= */

    const authHeader = req.headers.authorization;

    if (!authHeader) {

      return res.status(401).json({
        error: "Authorization token missing"
      });

    }

    /* =========================================
       CHECK BEARER FORMAT
    ========================================= */

    if (!authHeader.startsWith("Bearer ")) {

      return res.status(401).json({
        error: "Invalid authorization format"
      });

    }

    /* =========================================
       EXTRACT TOKEN
    ========================================= */

    const token = authHeader.split(" ")[1];

    if (!token) {

      return res.status(401).json({
        error: "Token missing"
      });

    }

    /* =========================================
       VERIFY JWT SECRET EXISTS
    ========================================= */

    if (!process.env.JWT_SECRET) {

      console.error("JWT_SECRET missing in environment");

      return res.status(500).json({
        error: "Server configuration error"
      });

    }

    /* =========================================
       VERIFY TOKEN
    ========================================= */

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    /* =========================================
       ATTACH USER DATA
    ========================================= */

    req.userId = decoded.userId;
    req.user = decoded;

    next();

  } catch (error) {

    console.error("Auth middleware error:", error.message);

    return res.status(401).json({
      error: "Invalid or expired token"
    });

  }

};

export default authMiddleware;