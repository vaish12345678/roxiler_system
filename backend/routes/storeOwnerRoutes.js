
const express = require("express");
const router = express.Router();

const {
  getDashboard,
  getStoreRatings
} = require("../controllers/storeOwnerController");

const {
  authenticate,
  authorize
} = require("../middleware/authMiddleware");

router.use(authenticate, authorize("STORE_OWNER"));

router.get("/dashboard", getDashboard);
router.get("/stores/:storeId/ratings", getStoreRatings);

module.exports = router;
