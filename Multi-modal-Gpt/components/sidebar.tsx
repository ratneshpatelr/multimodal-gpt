"use client";
import { useEffect, useState } from "react";
import { Pencil2Icon } from "@radix-ui/react-icons";
import Image from "next/image";
import { ChatOptions } from "./chat/chat-options";
import SidebarTabs from "./sidebar-tabs";
import Link from "next/link";
import {env} from "../env"

interface SidebarProps {
  isCollapsed: boolean;
  onClick?: () => void;
  isMobile: boolean;
  chatId: string;
  setChatId: React.Dispatch<React.SetStateAction<string>>;
  chatOptions: ChatOptions;
  setChatOptions: React.Dispatch<React.SetStateAction<ChatOptions>>;
  userId: string;
}

interface ChatPreview {
  id: string;
  preview: string;
  updatedAt: string;
  messageCount: number;
}

interface ChatsResponse {
  chats: ChatPreview[];
}

interface GroupedChats {
  [key: string]: ChatPreview[];
}

export function Sidebar({
  isCollapsed,
  isMobile,
  chatId,
  setChatId,
  chatOptions,
  setChatOptions,
  userId,
}: SidebarProps) {
  const [groupedChats, setGroupedChats] = useState<GroupedChats>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/chats`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          const data: ChatsResponse = await response.json();
          // Group chats by date
          const groupedData = groupChatsByDate(data.chats);
          setGroupedChats(groupedData);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [userId]);

  const groupChatsByDate = (chats: ChatPreview[]): GroupedChats => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groupedChats: GroupedChats = {};

    chats.forEach((chat) => {
      const updatedAt = new Date(chat.updatedAt);
      const diffInDays = Math.floor(
        (today.getTime() - updatedAt.getTime()) / (1000 * 3600 * 24)
      );

      let group: string;
      if (diffInDays === 0) {
        group = "Today";
      } else if (diffInDays === 1) {
        group = "Yesterday";
      } else if (diffInDays <= 7) {
        group = "Previous 7 Days";
      } else if (diffInDays <= 30) {
        group = "Previous 30 Days";
      } else {
        group = "Older";
      }

      if (!groupedChats[group]) {
        groupedChats[group] = [];
      }
      groupedChats[group].push(chat);
    });

    return groupedChats;
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_BACKEND_URL}/chat/${chatId}?userId=${userId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Remove the chat from the state
        setGroupedChats((prevChats) => {
          const newChats = { ...prevChats };
          Object.keys(newChats).forEach((group) => {
            newChats[group] = newChats[group].filter(
              (chat) => chat.id !== chatId
            );
            if (newChats[group].length === 0) {
              delete newChats[group];
            }
          });
          return newChats;
        });
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  return (
    <div
      data-collapsed={isCollapsed}
      className="relative justify-between group bg-accent/20 dark:bg-card/35 flex flex-col h-full gap-4 data-[collapsed=true]:p-0 data-[collapsed=true]:hidden"
    >
      <div className="sticky left-0 right-0 top-0 z-20 p-1 rounded-sm m-2">
        <Link
          className="flex w-full h-10 text-sm font-medium items-center
          border border-input bg-background hover:bg-accent hover:text-accent-foreground
          px-2 py-2 rounded-sm"
          href="/"
          onClick={() => {
            setChatId("");
          }}
        >
          <div className="flex gap-3 p-2 items-center justify-between w-full">
            <div className="flex align-start gap-2">
              {!isCollapsed && !isMobile && (
                <Image
                  src={"/ollama.png"}
                  alt="AI"
                  width={14}
                  height={14}
                  className="dark:invert 2xl:block"
                />
              )}
              <span>New chat</span>
            </div>
            <Pencil2Icon className="w-4 h-4" />
          </div>
        </Link>
      </div>
      <SidebarTabs
        isLoading={isLoading}
        localChats={groupedChats}
        selectedChatId={chatId}
        chatOptions={chatOptions}
        setChatOptions={setChatOptions}
        handleDeleteChat={handleDeleteChat}
      />
    </div>
  );
}
