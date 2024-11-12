import type { Request, Response } from "express";
import { reformulateSystemPrompt } from "../prompts/reformulate.system.prompt";
import { vectorStore } from "../lib/vector-store-initialzation";
import { getGroqCompletion } from "../config/groq-completion";
import { chatHistoryService } from "../services/chatHistory.service";
import { prisma } from "../app";

interface ChatMessage {
  role: string;
  content: string;
  reference?: string;
  modifiedFrom?: string;
}

interface IUserBody {
  message: string;
  history: any[];
  referenceId?: string;
  chatId: string;
  userId: string;
}

export const ChatController = async (req: Request, res: Response) => {
  const { message, history, referenceId, chatId, userId } =
    req.body as IUserBody;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingChat = await chatHistoryService.getChatHistory(
      user.id,
      chatId
    );

    const isNewChat = !existingChat;

    if (isNewChat) {
      await prisma.chatHistory.create({
        data: {
          chatId,
          userId: user.id, 
          messages: {
            create: {
              role: "user",
              content: message,
            },
          },
        },
      });
    }

    if (referenceId) {
      const previousMessage = history.find(
        (msg: ChatMessage) => msg.reference === referenceId
      );

      if (previousMessage) {
        const modificationPrompt = `
          Original content: "${previousMessage.content}"
          Modification request: "${message}"
          Apply the requested modification to the original content while maintaining context.
          If this is a code modification, ensure the modified code is complete and functional.
        `;

        const modifiedResponse = await getGroqCompletion([
          {
            role: "system",
            content:
              "You are tasked with modifying the previous response based on the user's request. Maintain context and apply the requested changes. For code modifications, ensure the code remains complete and functional.",
          },
          { role: "user", content: modificationPrompt },
        ]);

        return res.status(200).json({
          response: modifiedResponse,
          history: [
            ...history,
            {
              role: "assistant",
              content: modifiedResponse,
              reference: `mod_${Date.now()}`,
              modifiedFrom: referenceId,
            },
          ],
        });
      }
    }

    // Handle new questions
    const reformulatedQuestion = await reformulateSystemPrompt(
      message,
      isNewChat ? [] : existingChat?.messages || []
    );

    console.log("existing chat", existingChat?.messages)

    // Get vector store results
    const results = await vectorStore.similaritySearch(reformulatedQuestion, 3);
    const context = results
      .map(
        (doc) =>
          `[Source: ${doc.metadata.source || "Unknown"}]\n${doc.pageContent}`
      )
      .join("\n\n");

    // Check context relevance
    const relevanceCheckPrompt = `
      Question: "${reformulatedQuestion}"
      Context: "${context}"
      
      Is the provided context directly relevant to answering the question? 
      Respond with either "RELEVANT" or "NOT_RELEVANT".
      If the context doesn't provide specific information about the exact topic being asked, respond with "NOT_RELEVANT".
    `;

    const relevanceCheck = await getGroqCompletion([
      {
        role: "system",
        content:
          "You are a relevance checking assistant. Be strict in determining relevance.",
      },
      { role: "user", content: relevanceCheckPrompt },
    ]); // REVELANT OR NOT_RELEVANT

    let systemPrompt;
    if (relevanceCheck.includes("RELEVANT")) {
      // Use vector store context for domain-specific questions
      systemPrompt = `
        You are an AI assistant tasked with answering questions based on the content of websites, documents, and image classification.
        Use the following pieces of retrieved context to answer the user's question.
        Always mention the source of the information in your answer.
        Keep your answer concise, using no more than three sentences.
        
        Context:
        ${context}
      `;
    } else {
      // Use general knowledge for common programming/technical questions
      systemPrompt = `
        You are a helpful AI assistant with expertise in programming, technology, and general knowledge.
        Provide clear, accurate, and practical answers to questions.
        If the question is about programming, include relevant code examples.
        Keep your answers concise but informative.
        When providing code examples, ensure they are complete and functional.
      `;
    }

    const chatMessages = isNewChat
      ? []
      : existingChat?.messages?.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })) || [];

    const response = await getGroqCompletion([
      { role: "system", content: systemPrompt },
      ...chatMessages,
      { role: "user", content: reformulatedQuestion },
    ]);

    if (!isNewChat) {
      await chatHistoryService.createOrUpdateChat(user.id, chatId, {
        role: "user",
        content: message,
      });
    }

    await chatHistoryService.createOrUpdateChat(user.id, chatId, {
      role: "assistant",
      content: response,
    });

    // Get updated chat history using user.id
    const updatedHistory = await chatHistoryService.getChatHistory(
      user.id,
      chatId
    );

    res.status(200).json({
      response,
      history: updatedHistory?.messages || [],
      responseId: `resp_${Date.now()}`,
      isVectorStoreResponse: relevanceCheck.includes("RELEVANT"),
      isNewChat,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const GetChatHistoryController = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const { userId } = req.query;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId as string },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const chatHistory = await chatHistoryService.getChatHistory(
      user.id,
      chatId
    );

    if (!chatHistory) {
      return res.status(404).json({ message: "Chat history not found" });
    }

    res.status(200).json({
      messages: chatHistory.messages,
      chatId: chatHistory.chatId,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const GetUserChatsController = async (req: Request, res: Response) => {
  const { userId } = req.body;

  console.log("userId", userId);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Get user ID from Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const chats = await chatHistoryService.getUserChats(user.id);

    // Transform the data to include preview information
    const formattedChats = chats.map((chat) => ({
      id: chat.chatId,
      preview: chat.messages[0]?.content || "New Chat",
      updatedAt: chat.updatedAt,
      messageCount: chat.messages.length,
    }));

    res.status(200).json({
      chats: formattedChats,
    });
  } catch (error) {
    console.error("Error fetching user chats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
