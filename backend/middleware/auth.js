const jwt = require("jsonwebtoken");
const prisma = require("../db/prisma");

async function authenticate(req, res, next) {
  try {
    let token;

    if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    if (!token && req.headers.authorization) {
      const [type, value] = req.headers.authorization.split(" ");
      if (type === "Bearer") {
        token = value;
      }
    }

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized: token tidak ditemukan",
      });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized: user tidak valid",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized: token tidak valid atau kadaluarsa",
    });
  }
}

function authorizeAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Forbidden: Anda Bukan Admin!",
    });
  }

  next();
}

module.exports = { authenticate, authorizeAdmin };
