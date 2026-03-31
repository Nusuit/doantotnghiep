const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/auth");
const ChatService = require("../services/chatService");

function sendChatDisabled(res, error) {
  return res.status(error?.status || 410).json({
    success: false,
    code: error?.code || "CHAT_DISABLED",
    error: "Chat legacy storage has been removed from the current Prisma contract",
  });
}

// Get user's chat conversations
router.get("/conversations", authenticateJWT, async (req, res) => {
  try {
    const conversations = await ChatService.getUserConversations(req.user.id);
    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    return sendChatDisabled(res, error);
  }
});

// Get messages from a specific conversation
router.get(
  "/conversations/:conversationId/messages",
  authenticateJWT,
  async (req, res) => {
    try {
      const { conversationId } = req.params;
      const messages = await ChatService.getConversationMessages(
        req.user.id,
        conversationId
      );

      res.json({
        success: true,
        data: messages,
      });
    } catch (error) {
      return sendChatDisabled(res, error);
    }
  }
);

// Send a message and get AI response
router.post(
  "/conversations/:conversationId/messages",
  authenticateJWT,
  async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { message } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          error: "Tin nhắn không được để trống",
        });
      }

      // Save user message and get AI response
      const response = await ChatService.sendMessage(
        req.user.id,
        conversationId,
        message
      );

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      return sendChatDisabled(res, error);
    }
  }
);

// Create new conversation
router.post("/conversations", authenticateJWT, async (req, res) => {
  try {
    const { title, firstMessage } = req.body;

    const conversation = await ChatService.createConversation(
      req.user.id,
      title || "Cuộc trò chuyện mới",
      firstMessage
    );

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    return sendChatDisabled(res, error);
  }
});

// Delete conversation
router.delete(
  "/conversations/:conversationId",
  authenticateJWT,
  async (req, res) => {
    try {
      const { conversationId } = req.params;

      await ChatService.deleteConversation(req.user.id, conversationId);

      res.json({
        success: true,
        message: "Đã xóa cuộc trò chuyện",
      });
    } catch (error) {
      return sendChatDisabled(res, error);
    }
  }
);

module.exports = router;
