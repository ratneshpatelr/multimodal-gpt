"use client";
import { useAuth } from "@clerk/nextjs";
import React, { useState } from "react";
import { toast } from "sonner";
import ChatBottombar from "~/components/chat/chat-bottombar";
import ChatList from "~/components/chat/chat-lists";
import { PDFViewer } from "~/components/pdf-viewer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { env } from "~/env";

export default function Panels({chatId, setChatId}: {chatId: string, setChatId: (chatId: string) => void}) {
  const [pdfUrl, setPdfUrl] = useState("");

  const handleUploadSuccess = (url: string) => {
    setPdfUrl(url);
  };
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

  React.useEffect(() => {
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
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full min-h-screen max-w-full rounded-lg border"
    >
      <ResizablePanel defaultSize={50}>
        <div className="flex flex-col justify-between w-full h-full">
          <div className="mt-5">
          <ChatList messages={messages} isLoading={isLoading} />

          </div>
          <div className="px-4 ml-8">
            <ChatBottombar
              selectedModel={"gpt-3.5-turbo"}
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={() => {}}
            />
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <PDFViewer pdfUrl={pdfUrl} onUploadSuccess={handleUploadSuccess} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
