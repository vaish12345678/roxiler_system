// const db = require("../config/db");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// const register = async (req, res) => {
//     try {
//         const { name, email, password, address } = req.body;

//         if (!name || !email || !password || !address) {
//             return res.status(400).json({
//                 message: "All fields are required"
//             });
//         }

//         if (name.length < 20 || name.length > 60) {
//             return res.status(400).json({
//                 message: "Name must be between 20 and 60 characters"
//             });
//         }

//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//         if (!emailRegex.test(email)) {
//             return res.status(400).json({
//                 message: "Invalid email address"
//             });
//         }

//         if (
//             password.length < 8 ||
//             password.length > 16 ||
//             !/[A-Z]/.test(password) ||
//             !/[^A-Za-z0-9]/.test(password)
//         ) {
//             return res.status(400).json({
//                 message: "Password must be 8-16 characters and contain an uppercase letter and special character"
//             });
//         }

//         if (address.length > 400) {
//             return res.status(400).json({
//                 message: "Address cannot exceed 400 characters"
//             });
//         }

//         const [existing] = await db.query(
//             "SELECT id FROM users WHERE email = ?",
//             [email]
//         );

//         if (existing.length > 0) {
//             return res.status(409).json({
//                 message: "Email already registered"
//             });
//         }

//         const hashedPassword = await bcrypt.hash(password, 12);

//         const [result] = await db.query(
//             `INSERT INTO users
//             (name, email, password, address, role)
//             VALUES (?, ?, ?, ?, 'USER')`,
//             [name, email, hashedPassword, address]
//         );

//         res.status(201).json({
//             success: true,
//             message: "Registration successful",
//             userId: result.insertId
//         });

//     } catch (error) {
//         console.error(error);

//         res.status(500).json({
//             message: "Registration failed"
//         });
//     }
// };

// const login = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({
//                 message: "Email and password are required"
//             });
//         }

//         const [users] = await db.query(
//             "SELECT * FROM users WHERE email = ?",
//             [email]
//         );

//         if (users.length === 0) {
//             return res.status(401).json({
//                 message: "Invalid email or password"
//             });
//         }

//         const user = users[0];

//         const isMatch = await bcrypt.compare(
//             password,
//             user.password
//         );

//         if (!isMatch) {
//             return res.status(401).json({
//                 message: "Invalid email or password"
//             });
//         }

//         const token = jwt.sign(
//             {
//                 id: user.id,
//                 role: user.role
//             },
//             process.env.JWT_SECRET,
//             { expiresIn: "1d" }
//         );

//         res.status(200).json({
//             success: true,
//             message: "Login successful",
//             token,
//             user: {
//                 id: user.id,
//                 name: user.name,
//                 email: user.email,
//                 address: user.address,
//                 role: user.role
//             }
//         });

//     } catch (error) {
//         console.error(error);

//         res.status(500).json({
//             message: "Login failed"
//         });
//     }
// };

// module.exports = { register, login };




const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER USER
const register = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Required fields
    if (!name || !email || !password || !address) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // Name validation
    if (
      typeof name !== "string" ||
      name.trim().length < 20 ||
      name.trim().length > 60
    ) {
      return res.status(400).json({
        message: "Name must be between 20 and 60 characters"
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.trim().toLowerCase();

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Invalid email address"
      });
    }

    // Password validation
    if (
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 16 ||
      !/[A-Z]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      return res.status(400).json({
        message:
          "Password must be 8-16 characters and contain an uppercase letter and special character"
      });
    }

    // Address validation
    if (
      typeof address !== "string" ||
      address.trim().length === 0 ||
      address.length > 400
    ) {
      return res.status(400).json({
        message: "Address is required and cannot exceed 400 characters"
      });
    }

    // Check existing user
    const existingUser = await prisma.users.findUnique({
      where: {
        email: normalizedEmail
      }
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user using Prisma
    const newUser = await prisma.users.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        address: address.trim(),
        role: "USER"
      }
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      userId: newUser.id
    });

  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    return res.status(500).json({
      message: "Registration failed"
    });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await prisma.users.findUnique({
      where: {
        email: email.trim().toLowerCase()
      }
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Store JWT in an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/"
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed"
    });
  }
};
const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    if (
      newPassword.length < 8 ||
      newPassword.length > 16 ||
      !/[A-Z]/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      return res.status(400).json({
        success: false,
        message: "Password must be 8-16 characters with an uppercase letter and special character"
      });
    }

    const user = await prisma.users.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.users.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password"
    });
  }
};
const getMe = async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true
      }
    });

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch session"
    });
  }
};

module.exports = {
  register,
  login,
  changePassword,
  logout,
  getMe
};
