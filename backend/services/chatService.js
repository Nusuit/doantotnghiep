class ChatService {
  getDisabledError() {
    const error = new Error("Chat legacy tables were removed from the Prisma contract.");
    error.status = 410;
    error.code = "CHAT_DISABLED";
    return error;
  }

  async getUserConversations() {
    throw this.getDisabledError();
  }

  async getConversationMessages() {
    throw this.getDisabledError();
  }

  async sendMessage() {
    throw this.getDisabledError();
  }

  async createConversation() {
    throw this.getDisabledError();
  }

  async deleteConversation() {
    throw this.getDisabledError();
  }
}

module.exports = new ChatService();
