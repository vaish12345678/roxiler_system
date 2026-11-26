
const express = require("express");
const router = express.Router();

const {
  createUser,
  createStore,
  getDashboardStats,
  getUsers,
  getStores,
  getUserDetails,
    getStoreOwners,

} = require("../controllers/adminController");

const {
  authenticate,
  authorize
} = require("../middleware/authMiddleware");

router.use(authenticate, authorize("ADMIN"));

router.post("/users", createUser);
router.post("/stores", createStore);

router.get("/dashboard", getDashboardStats);
router.get("/users", getUsers);
router.get("/stores", getStores);
router.get("/users/:id", getUserDetails);
router.get("/store-owners", authenticate, authorize("ADMIN"), getStoreOwners);
module.exports = router;
