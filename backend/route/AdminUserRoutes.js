const express = require("express");
const router = express.Router();
const AdminUserController = require("../controllers/AdminUserController");
const { authenticate, authorizeAdmin } = require("../middleware/auth");
const upload = require("../service/Multer");

router.use(authenticate, authorizeAdmin);

router.get("/", AdminUserController.getAllUsers);
router.get("/stats", AdminUserController.getUserStats);
router.get("/search", AdminUserController.searchUsers);
router.get("/:id", AdminUserController.getUserById);
router.get("/:id/activity", AdminUserController.getUserActivity);
router.post("/", upload, AdminUserController.createUser);
router.patch("/:id", upload, AdminUserController.updateUser);
router.delete("/:id", AdminUserController.deleteUser);
router.patch(
  "/:id/toggle-verification",
  AdminUserController.toggleVerification
);

module.exports = router;
