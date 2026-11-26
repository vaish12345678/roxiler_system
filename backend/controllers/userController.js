
const prisma = require("../config/prisma");

// GET ALL STORES
exports.getStores = async (req, res) => {
  try {
    const {
      search = "",
      name = "",
      address = "",
      sortBy = "name",
      sortOrder = "asc",
      page = 1,
      limit = 10
    } = req.query;

    const allowedSortFields = ["id", "name", "email", "address", "created_at"];

    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "name";

    const safeSortOrder = sortOrder.toLowerCase() === "desc"
      ? "desc"
      : "asc";

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    const where = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search } },
                { address: { contains: search } }
              ]
            }
          : {},
        name ? { name: { contains: name } } : {},
        address ? { address: { contains: address } } : {}
      ]
    };

    const [stores, total] = await Promise.all([
      prisma.stores.findMany({
        where,
        include: {
          ratings: {
            select: {
              rating: true,
              user_id: true
            }
          }
        },
        orderBy: {
          [safeSortBy]: safeSortOrder
        },
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber
      }),
      prisma.stores.count({ where })
    ]);

    const result = stores.map((store) => {
      const totalRatings = store.ratings.length;

      const averageRating = totalRatings
        ? store.ratings.reduce((sum, item) => sum + item.rating, 0) / totalRatings
        : 0;

      const myRating = store.ratings.find(
        (item) => item.user_id === req.user.id
      );

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: Number(averageRating.toFixed(2)),
        totalRatings,
        myRating: myRating ? myRating.rating : null
      };
    });

    res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      stores: result
    });
  } catch (error) {
    console.error("Get stores error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stores"
    });
  }
};

// SUBMIT OR UPDATE STORE RATING
exports.submitRating = async (req, res) => {
  try {
    const storeId = Number(req.params.storeId);
    const { rating } = req.body;

    if (!Number.isInteger(storeId) || storeId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID"
      });
    }

    const ratingValue = Number(rating);

    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5"
      });
    }

    const store = await prisma.stores.findUnique({
      where: { id: storeId }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found"
      });
    }

    const savedRating = await prisma.ratings.upsert({
      where: {
        user_id_store_id: {
          user_id: req.user.id,
          store_id: storeId
        }
      },
      update: {
        rating: ratingValue,
        updated_at: new Date()
      },
      create: {
        user_id: req.user.id,
        store_id: storeId,
        rating: ratingValue
      }
    });

    res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
      rating: savedRating
    });
  } catch (error) {
    console.error("Submit rating error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit rating"
    });
  }
};
