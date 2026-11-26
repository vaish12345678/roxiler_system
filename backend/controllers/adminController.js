


const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

   
    if (
      typeof name !== "string" ||
      name.trim().length < 20 ||
      name.trim().length > 60
    ) {
      return res.status(400).json({
        message: "Name must be between 20 and 60 characters"
      });
    }

    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Invalid email"
      });
    }

  
    if (
      typeof address !== "string" ||
      address.trim().length === 0 ||
      address.length > 400
    ) {
      return res.status(400).json({
        message: "Address is required and must be within 400 characters"
      });
    }

    if (
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 16 ||
      !/[A-Z]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      return res.status(400).json({
        message:
          "Password must be 8-16 characters with uppercase and special character"
      });
    }

    const allowedRoles = ["ADMIN", "USER", "STORE_OWNER"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role"
      });
    }

    const existingUser = await prisma.users.findUnique({
      where: {
        email: normalizedEmail
      }
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists"
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
        role: role
      }
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      userId: newUser.id
    });

  } catch (error) {
    console.error("Create user error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    return res.status(500).json({
      message: "Server error"
    });
  }
};

exports.createStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    
    if (
      typeof name !== "string" ||
      name.trim().length < 20 ||
      name.trim().length > 60
    ) {
      return res.status(400).json({
        message: "Store name must be between 20 and 60 characters"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Invalid email"
      });
    }

    if (
      typeof address !== "string" ||
      address.trim().length === 0 ||
      address.length > 400
    ) {
      return res.status(400).json({
        message: "Address is required and cannot exceed 400 characters"
      });
    }

    const parsedOwnerId = Number(owner_id);

    if (!Number.isInteger(parsedOwnerId) || parsedOwnerId <= 0) {
      return res.status(400).json({
        message: "A valid store owner ID is required"
      });
    }
    const owner = await prisma.users.findFirst({
      where: {
        id: parsedOwnerId,
        role: "STORE_OWNER"
      }
    });

    if (!owner) {
      return res.status(400).json({
        message: "Invalid store owner. Please select a registered STORE_OWNER."
      });
    }
    const newStore = await prisma.stores.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        address: address.trim(),
        owner_id: parsedOwnerId
      }
    });

    return res.status(201).json({
      success: true,
      message: "Store created successfully",
      storeId: newStore.id
    });

  } catch (error) {
    console.error("Create store error:", error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};


// ADMIN DASHBOARD STATISTICS
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStores,
      totalRatings,
      ratingAverage
    ] = await Promise.all([
      prisma.users.count(),
      prisma.stores.count(),
      prisma.ratings.count(),
      prisma.ratings.aggregate({
        _avg: {
          rating: true
        }
      })
    ]);

    const averageRating = Number(
      (ratingAverage._avg.rating || 0).toFixed(2)
    );

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStores,
        totalRatings,
        averageRating
      }
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics"
    });
  }
};


exports.getUsers = async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      role,
      sortBy = "created_at",
      sortOrder = "desc",
      page = 1,
      limit = 10
    } = req.query;

    const allowedRoles = ["ADMIN", "USER", "STORE_OWNER"];
    const allowedSortFields = [
      "id", "name", "email", "address", "role", "created_at"
    ];

    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }

    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "created_at";

    const safeSortOrder = sortOrder.toLowerCase() === "asc"
      ? "asc"
      : "desc";

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    const where = {
      AND: [
        name ? { name: { contains: name } } : {},
        email ? { email: { contains: email } } : {},
        address ? { address: { contains: address } } : {},
        role ? { role } : {}
      ]
    };

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          role: true,
          created_at: true
        },
        orderBy: {
          [safeSortBy]: safeSortOrder
        },
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber
      }),
      prisma.users.count({ where })
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      users
    });

  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    });
  }
};


// 3. GET ALL STORES WITH SEARCH, FILTER AND SORT
exports.getStores = async (req, res) => {
  try {
    const {
      search,
      name,
      email,
      address,
      sortBy = "created_at",
      sortOrder = "desc",
      page = 1,
      limit = 10
    } = req.query;

    const allowedSortFields = [
      "id",
      "name",
      "email",
      "address",
      "created_at"
    ];

    if (!allowedSortFields.includes(sortBy) &&
        sortBy !== "averageRating") {
      return res.status(400).json({ message: "Invalid sort field" });
    }

    if (!["asc", "desc"].includes(sortOrder)) {
      return res.status(400).json({ message: "Invalid sort order" });
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    const where = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search } },
                { email: { contains: search } },
                { address: { contains: search } }
              ]
            }
          : {},
        name ? { name: { contains: name } } : {},
        email ? { email: { contains: email } } : {},
        address ? { address: { contains: address } } : {}
      ]
    };

    const stores = await prisma.stores.findMany({
      where,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        ratings: {
          select: {
            rating: true
          }
        }
      },
      orderBy: sortBy === "averageRating"
        ? undefined
        : { [sortBy]: sortOrder }
    });

    // Calculate average rating for every store
    const formattedStores = stores.map((store) => {
      const totalRatings = store.ratings.length;

      const averageRating = totalRatings > 0
        ? Number(
            (
              store.ratings.reduce((sum, item) => sum + item.rating, 0) /
              totalRatings
            ).toFixed(2)
          )
        : 0;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        owner: store.users,
        averageRating,
        totalRatings
      };
    });

    // Sort by calculated average rating if requested
    if (sortBy === "averageRating") {
      formattedStores.sort((a, b) =>
        sortOrder === "asc"
          ? a.averageRating - b.averageRating
          : b.averageRating - a.averageRating
      );
    }

    const total = formattedStores.length;

    const paginatedStores = formattedStores.slice(
      (pageNumber - 1) * pageSize,
      pageNumber * pageSize
    );

    return res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / pageSize),
      stores: paginatedStores
    });

  } catch (error) {
    console.error("Get stores error:", error);
    return res.status(500).json({
      message: "Failed to fetch stores"
    });
  }
};


// 4. GET INDIVIDUAL USER DETAILS
exports.getUserDetails = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        message: "Invalid user ID"
      });
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        created_at: true,
        stores: {
          select: {
            id: true,
            name: true,
            ratings: {
              select: {
                rating: true
              }
            }
          }
        },
        ratings: {
          select: {
            id: true,
            rating: true,
            stores: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const ownedStores = user.stores.map((store) => {
      const totalRatings = store.ratings.length;

      const averageRating = totalRatings
        ? Number(
            (
              store.ratings.reduce((sum, item) => sum + item.rating, 0) /
              totalRatings
            ).toFixed(2)
          )
        : 0;

      return {
        id: store.id,
        name: store.name,
        averageRating,
        totalRatings
      };
    });

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        stores: ownedStores
      }
    });

  } catch (error) {
    console.error("Get user details error:", error);
    return res.status(500).json({
      message: "Failed to fetch user details"
    });
  }
};


// GET ALL STORE OWNERS FOR STORE ASSIGNMENT

exports.getStoreOwners = async (req, res) => {
  try {
    const owners = await prisma.users.findMany({
      where: {
        role: "STORE_OWNER",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      owners,
    });
  } catch (error) {
    console.error("Get store owners error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch store owners",
    });
  }
};
