"use client";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Loader2, Send } from "lucide-react";
import { env } from "~/env";
import { toast } from "sonner";
import ChatInterfaceSite from "./chat-interface";


type Props = {
  chatId: string;
  setChatId: React.Dispatch<React.SetStateAction<string>>;
};

export default function WebsiteScrapper({ chatId, setChatId }: Props) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isScraped, setIsScraped] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>(
    []
  );
  const [inputMessage, setInputMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/scrape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to process website");
      }

      const data = await response.json();
      setIsScraped(true);
      setMessages([
        {
          text: `Website scraped successfully! ${data.documentsAdded} documents were processed.`,
          isUser: false,
        },
      ]);
    } catch (error) {
      console.error("Error scraping website:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setMessages((prev) => [...prev, { text: userMessage, isUser: true }]);

    // Simulate a response for now
    setMessages((prev) => [
      ...prev,
      { text: "Processing your request...", isUser: false },
    ]);

    // Simulate delay for response
    setTimeout(() => {
      setMessages((prev) => {
        const newMessages = prev.slice(0, -1); // Remove loading message
        return [
          ...newMessages,
          {
            text: "This is a simulated response. Implement your chat API to get real responses.",
            isUser: false,
          },
        ];
      });
    }, 1000);
  };

  return (
    <>
      {!isScraped && (
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Website Scraper and Chat</CardTitle>
              {error && (
                <div className="text-red-500 text-sm mt-2">Error: {error}</div>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="url"
                  placeholder="Enter website URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full"
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !url.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scraping...
                    </>
                  ) : (
                    "Start Scraping"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="text-sm text-gray-500">
              Enter a website URL to scrape and chat with the data.
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Display Chat Interface after scraping */}
      {isScraped && <ChatInterfaceSite chatId={chatId} />}
    </>
  );
}
