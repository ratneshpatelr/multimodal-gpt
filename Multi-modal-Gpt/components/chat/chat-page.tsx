"use client";

import React, { useEffect } from "react";
import { ChatLayout } from "./chat-layout";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { env } from "~/env";

interface ChatPageProps {
  chatId: string;
  setChatId: React.Dispatch<React.SetStateAction<string>>;
}

export default function ChatPage({ chatId, setChatId }: ChatPageProps) {
  interface Message {
    role: string;
    content: string;
  }

  const { userId } = useAuth();

  console.log(userId);

  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [stop, setStop] = React.useState(false);

  useEffect(() => {
    const loadChatHistory = async () => {
      if (!chatId || !userId) return;

      try {
        const response = await fetch(
          `${env.NEXT_PUBLIC_BACKEND_URL}/chat/${chatId}?userId=${userId}`
        );

        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };

    loadChatHistory();
  }, [chatId, userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input) {
      return;
    }

    const newMessage = { role: "user", content: input };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          history: updatedMessages,
          chatId,
          userId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          role: "assistant",
          content: data.response,
          // reference: data.responseId,
        };
        setMessages(data.history || [...updatedMessages, assistantMessage]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message");
      }
    } catch (error) {
      toast.error("Something went wrong");
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex h-[calc(100dvh)] flex-col items-center ">
      <ChatLayout
        userId={userId!}
        chatId={chatId}
        setChatId={setChatId}
        setChatOptions={() => {}}
        chatOptions={{
          selectedModel: "gpt-3.5-turbo",
          systemPrompt: "Talk to me",
          temperature: 0.5,
        }}
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        stop={() => {}}
        navCollapsedSize={10}
        defaultLayout={[30, 160]}
      />
    </main>
  );
}
