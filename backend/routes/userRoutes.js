
const express = require("express");
const router = express.Router();

const {
  getStores,
  submitRating
} = require("../controllers/userController");

const {
  authenticate,
  authorize
} = require("../middleware/authMiddleware");

router.use(authenticate, authorize("USER"));

router.get("/stores", getStores);
router.post("/stores/:storeId/rating", submitRating);

module.exports = router;
