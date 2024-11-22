"use client";

import React, { useRef, useState } from "react";
import { PaperPlaneIcon, StopIcon } from "@radix-ui/react-icons";
import { FaImages } from "react-icons/fa";
import TextareaAutosize from "react-textarea-autosize";
import { env } from "~/env";
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

interface UploadResponse {
  success: boolean;
  url?: string;
  message?: string;
  error?: string;
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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (allowedTypes.includes(file.type) && file.size <= maxSize) {
        setSelectedImage(file);
        setUploadError(null);
        console.log('File selected:', {
          name: file.name,
          type: file.type,
          size: file.size
        });
      } else {
        setUploadError('Please select a valid image (JPEG, PNG, GIF, WEBP) under 5MB');
        e.target.value = '';
      }
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setUploadError(null);
    setUploadedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (): Promise<UploadResponse | null> => {
    if (!selectedImage) return null;

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append('image', selectedImage);

      console.log('Starting image upload...', {
        fileName: selectedImage.name,
        fileType: selectedImage.type,
        fileSize: selectedImage.size
      });

      const response = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/image-classify`, {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);

      const data: UploadResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      if (!data.success) {
        throw new Error(data.message || 'Upload failed');
      }

      console.log('Upload successful:', data);
      setUploadedImageUrl(data.url || null);
      setIsUploading(false);
      return data;

    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      setIsUploading(false);
      return null;
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadError(null);

    try {
      // If there's an image selected but not yet uploaded
      if (selectedImage) {
        console.log('Starting form submission with image...');
        const uploadResult = await uploadImage();

        if (!uploadResult?.success) {
          console.log('Image upload failed, stopping form submission');
          return;
        }

        // Create a new FormEvent with the uploaded image URL
        const newEvent = {
          ...e,
          currentTarget: {
            ...e.currentTarget,
            imageUrl: uploadedImageUrl
          }
        } as React.FormEvent<HTMLFormElement>;

        // Call the original handleSubmit with the modified event
        handleSubmit(newEvent);
        removeSelectedImage(); // Clear the image after successful submission
      } else {
        // If no image, just submit the form normally
        handleSubmit(e);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setUploadError('Failed to submit form. Please try again.');
    }
  };

  return (
    <div>
      <div className="stretch flex flex-row gap-3 last:mb-2 md:last:mb-6 mx-2 md:mx-auto md:max-w-2xl xl:max-w-3xl">
        <div key="input" className="w-full relative mb-1 items-center">
          <form
            onSubmit={handleFormSubmit}
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
              disabled={isUploading}
            >
              <FaImages className={`w-5 h-5 ${uploadedImageUrl ? 'text-green-500' : ''}`} />
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
                  disabled={isUploading}
                >
                  ✕
                </button>
              </div>
            )}

            {uploadError && (
              <div className="absolute bottom-16 left-0 text-red-500 text-xs bg-white p-1 rounded shadow">
                {uploadError}
              </div>
            )}

            <TextareaAutosize
              autoComplete="off"
              value={input}
              onChange={handleInputChange}
              name="message"
              placeholder={isUploading ? "Uploading image..." : "Ask vLLM anything..."}
              className="border-input max-h-48 px-4 py-4 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 dark:focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-50 w-full border rounded-md flex items-center h-14 resize-none overflow-hidden dark:bg-card/35 pl-12 pr-32"
              disabled={isUploading}
            />

            {!isLoading ? (
              <Button
                size="icon"
                className="absolute bottom-1.5 md:bottom-2 md:right-2 right-2 z-100"
                type="submit"
                disabled={isLoading || (!input.trim() && !selectedImage) || !hasSelectedModel || isUploading}
              >
                <PaperPlaneIcon className="w-5 h-5 text-white dark:text-black" />
              </Button>
            ) : (
              <Button
                size="icon"
                className="absolute bottom-1.5 md:bottom-2 md:right-2 right-2 z-100"
                onClick={stop}
                disabled={isUploading}
              >
                <StopIcon className="w-5 h-5 text-white dark:text-black" />
              </Button>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-black/5 flex items-center justify-center rounded-md">
                <div className="text-sm">Uploading...</div>
              </div>
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