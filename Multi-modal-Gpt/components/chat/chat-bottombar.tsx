"use client";

import React, { useRef, useState } from "react";
import { PaperPlaneIcon, StopIcon } from "@radix-ui/react-icons";
import { FaImages } from "react-icons/fa";
import TextareaAutosize from "react-textarea-autosize";

import { useHasMounted } from "../../lib/mount";
import { Button } from "../ui/button";

interface ChatBottombarProps {
  selectedModel: string | undefined;
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  stop: () => void;
}

export default function ChatBottombar({
  selectedModel = "gpt-3",
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
}: ChatBottombarProps) {
  const hasSelectedModel = selectedModel && selectedModel !== "";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (allowedTypes.includes(file.type) && file.size <= maxSize) {
        setSelectedImage(file);
        
        // Optional: Create a preview of the image
        const reader = new FileReader();
        reader.onloadend = () => {
          // You can store the preview URL if needed
          // setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // Handle invalid file
        alert('Please select a valid image (JPEG, PNG, GIF, WEBP) under 5MB');
        e.target.value = ''; // Clear the file input
      }
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input
    }
  };

  return (
    <div>
      <div className="stretch flex flex-row gap-3 last:mb-2 md:last:mb-6 mx-2  md:mx-auto md:max-w-2xl xl:max-w-3xl">
        <div key="input" className="w-full relative mb-1 items-center">
          <form
            onSubmit={handleSubmit}
            className="w-full items-center flex relative gap-2"
          >
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
            />

            <Button
              size="icon"
              variant="ghost"
              type="button"
              onClick={handleImageClick}
              className="absolute bottom-1.5 md:bottom-2 left-2 z-100"
            >
              <FaImages className="w-5 h-5" />
            </Button>

            {selectedImage && (
              <div className="absolute bottom-1.5 md:bottom-2 left-14 z-100 flex items-center">
                <span className="text-xs text-gray-500 mr-2">
                  {selectedImage.name}
                </span>
                <button 
                  type="button" 
                  onClick={removeSelectedImage}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            )}

            <TextareaAutosize
              autoComplete="off"
              value={input}
              onChange={handleInputChange}
              name="message"
              placeholder="Ask vLLM anything..."
              className="border-input max-h-48 px-4 py-4 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 dark:focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-50 w-full border rounded-md flex items-center h-14 resize-none overflow-hidden dark:bg-card/35 pl-12 pr-32"
            />

            {!isLoading ? (
              <Button
                size="icon"
                className="absolute bottom-1.5 md:bottom-2 md:right-2 right-2 z-100"
                type="submit"
                disabled={isLoading || !input.trim() || !hasSelectedModel}
              >
                <PaperPlaneIcon className="w-5 h-5 text-white dark:text-black" />
              </Button>
            ) : (
              <Button
                size="icon"
                className="absolute bottom-1.5 md:bottom-2 md:right-2 right-2 z-100"
                onClick={stop}
              >
                <StopIcon className="w-5 h-5 text-white dark:text-black" />
              </Button>
            )}
          </form>
        </div>
      </div>
      <div className="relative px-2 py-2 text-center text-xs text-slate-500 md:px-[60px]">
        <span>Enter to send, Shift + Enter for new line</span>
      </div>
    </div>
  );
}