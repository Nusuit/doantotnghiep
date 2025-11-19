const { PrismaClient } = require("@prisma/client");

class ChatService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  // Get user's chat conversations
  async getUserConversations(userId) {
    try {
      const conversations = await this.prisma.conversation.findMany({
        where: { userId },
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              content: true,
              createdAt: true,
            },
          },
          _count: {
            select: { messages: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      return conversations.map((conv) => ({
        id: conv.id,
        title: conv.title,
        preview: conv.messages[0]?.content || "",
        timestamp: conv.updatedAt,
        messageCount: conv._count.messages,
      }));
    } catch (error) {
      console.error("getUserConversations error:", error);
      throw error;
    }
  }

  // Get messages from a specific conversation
  async getConversationMessages(userId, conversationId) {
    try {
      // Verify conversation belongs to user
      const conversation = await this.prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
      });

      if (!conversation) {
        throw new Error("Conversation not found");
      }

      const messages = await this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          content: true,
          isUser: true,
          createdAt: true,
        },
      });

      return messages.map((msg) => ({
        id: msg.id,
        text: msg.content,
        isUser: msg.isUser,
        timestamp: msg.createdAt,
      }));
    } catch (error) {
      console.error("getConversationMessages error:", error);
      throw error;
    }
  }

  // Send message and get AI response
  async sendMessage(userId, conversationId, messageContent) {
    try {
      // Verify conversation belongs to user
      const conversation = await this.prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
      });

      if (!conversation) {
        throw new Error("Conversation not found");
      }

      // Save user message
      const userMessage = await this.prisma.message.create({
        data: {
          conversationId,
          content: messageContent,
          isUser: true,
        },
      });

      // Generate AI response (placeholder for now)
      const aiResponse = await this.generateAIResponse(messageContent);

      // Save AI response
      const botMessage = await this.prisma.message.create({
        data: {
          conversationId,
          content: aiResponse,
          isUser: false,
        },
      });

      // Update conversation timestamp
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return {
        userMessage: {
          id: userMessage.id,
          text: userMessage.content,
          isUser: true,
          timestamp: userMessage.createdAt,
        },
        botMessage: {
          id: botMessage.id,
          text: botMessage.content,
          isUser: false,
          timestamp: botMessage.createdAt,
        },
      };
    } catch (error) {
      console.error("sendMessage error:", error);
      throw error;
    }
  }

  // Create new conversation
  async createConversation(userId, title, firstMessage) {
    try {
      const conversation = await this.prisma.conversation.create({
        data: {
          userId,
          title,
        },
      });

      if (firstMessage) {
        await this.sendMessage(userId, conversation.id, firstMessage);
      }

      return {
        id: conversation.id,
        title: conversation.title,
        timestamp: conversation.createdAt,
      };
    } catch (error) {
      console.error("createConversation error:", error);
      throw error;
    }
  }

  // Delete conversation
  async deleteConversation(userId, conversationId) {
    try {
      // Verify conversation belongs to user
      const conversation = await this.prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
      });

      if (!conversation) {
        throw new Error("Conversation not found");
      }

      // Delete messages first (cascade should handle this, but being explicit)
      await this.prisma.message.deleteMany({
        where: { conversationId },
      });

      // Delete conversation
      await this.prisma.conversation.delete({
        where: { id: conversationId },
      });
    } catch (error) {
      console.error("deleteConversation error:", error);
      throw error;
    }
  }

  // Generate AI response (placeholder - integrate with your AI service)
  async generateAIResponse(userMessage) {
    try {
      // This is a placeholder. You should integrate with:
      // - OpenAI API
      // - Local AI model
      // - Custom AI service

      // For now, return a simple response
      const responses = [
        "Cảm ơn bạn đã hỏi. Tôi đang trong giai đoạn phát triển.",
        "Đây là một phản hồi mẫu từ chatbot.",
        "Tôi hiểu câu hỏi của bạn. Hãy để tôi suy nghĩ...",
        "Đó là một câu hỏi thú vị! Tôi sẽ cố gắng trả lời.",
      ];

      // Simple keyword-based responses
      const lowerMessage = userMessage.toLowerCase();

      if (lowerMessage.includes("xin chào") || lowerMessage.includes("hello")) {
        return "Xin chào! Tôi có thể giúp gì cho bạn?";
      }

      if (lowerMessage.includes("cảm ơn")) {
        return "Không có gì! Tôi luôn sẵn sàng giúp đỡ bạn.";
      }

      if (lowerMessage.includes("tạm biệt") || lowerMessage.includes("bye")) {
        return "Tạm biệt! Hẹn gặp lại bạn lần sau.";
      }

      // Random response for other messages
      return responses[Math.floor(Math.random() * responses.length)];
    } catch (error) {
      console.error("generateAIResponse error:", error);
      return "Xin lỗi, tôi không thể xử lý câu hỏi của bạn lúc này.";
    }
  }
}

module.exports = new ChatService();
