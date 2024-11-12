import { prisma } from "../app";

interface ChatMessage {
  role: string;
  content: string;
}

export const chatHistoryService = {
  async createOrUpdateChat(
    userId: string,
    chatId: string,
    message: ChatMessage
  ) {
    try {
      const chatHistory = await prisma.chatHistory.upsert({
        where: {
          userId_chatId: {
            userId,
            chatId,
          },
        },
        create: {
          chatId,
          userId,
          messages: {
            create: {
              role: message.role,
              content: message.content,
            },
          },
        },
        update: {
          messages: {
            create: {
              role: message.role,
              content: message.content,
            },
          },
          updatedAt: new Date(), // Explicitly update the timestamp
        },
        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });
      return chatHistory;
    } catch (error) {
      console.error("Error in createOrUpdateChat:", error);
      throw error;
    }
  },

  async getChatHistory(userId: string, chatId: string) {
    try {
      return prisma.chatHistory.findUnique({
        where: {
          userId_chatId: {
            userId,
            chatId,
          },
        },
        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });
    } catch (error) {
      console.error("Error in getChatHistory:", error);
      throw error;
    }
  },

  async getUserChats(userId: string) {
    try {
      return prisma.chatHistory.findMany({
        where: {
          userId,
        },
        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
            take: 1, // Only get the first message for preview
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    } catch (error) {
      console.error("Error in getUserChats:", error);
      throw error;
    }
  },

  async deleteChat(userId: string, chatId: string) {
    try {
      return prisma.chatHistory.delete({
        where: {
          userId_chatId: {
            userId,
            chatId,
          },
        },
      });
    } catch (error) {
      console.error("Error in deleteChat:", error);
      throw error;
    }
  },

  async clearAllChats(userId: string) {
    try {
      return prisma.chatHistory.deleteMany({
        where: {
          userId,
        },
      });
    } catch (error) {
      console.error("Error in clearAllChats:", error);
      throw error;
    }
  },
};
