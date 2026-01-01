const express = require("express");
const router = express.Router();
const { sendMessage, getMessages } = require("../controllers/ChatController");
const { authenticate } = require("../middleware/auth");
router.use(authenticate);

router.post("/", sendMessage);

router.get("/:chatRoomId", getMessages);

module.exports = router;
