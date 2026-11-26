
const prisma = require("../config/prisma");

// GET STORE OWNER DASHBOARD
exports.getDashboard = async (req, res) => {
  try {
    const stores = await prisma.stores.findMany({
      where: {
        owner_id: req.user.id
      },
      include: {
        ratings: {
          select: {
            rating: true
          }
        }
      }
    });

    const result = stores.map((store) => {
      const totalRatings = store.ratings.length;

      const averageRating = totalRatings
        ? store.ratings.reduce((sum, item) => sum + item.rating, 0) / totalRatings
        : 0;

      return {
        storeId: store.id,
        storeName: store.name,
        totalRatings,
        averageRating: Number(averageRating.toFixed(2))
      };
    });

    res.status(200).json({
      success: true,
      stores: result
    });

  } catch (error) {
    console.error("Store owner dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard"
    });
  }
};

// GET USERS WHO RATED OWNER'S STORE
exports.getStoreRatings = async (req, res) => {
  try {
    const storeId = Number(req.params.storeId);

    if (!Number.isInteger(storeId) || storeId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID"
      });
    }

    const store = await prisma.stores.findFirst({
      where: {
        id: storeId,
        owner_id: req.user.id
      },
      include: {
        ratings: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            created_at: "desc"
          }
        }
      }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found or access denied"
      });
    }

    const ratings = store.ratings.map((item) => ({
      userId: item.users.id,
      userName: item.users.name,
      email: item.users.email,
      rating: item.rating,
      submittedAt: item.created_at
    }));

    res.status(200).json({
      success: true,
      storeName: store.name,
      totalRatings: ratings.length,
      ratings
    });

  } catch (error) {
    console.error("Store ratings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch store ratings"
    });
  }
};
