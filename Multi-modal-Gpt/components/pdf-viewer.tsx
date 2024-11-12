"use client";

import React, { useState } from "react";
import { FileUpload } from "./ui/file-upload";
import { Loader2 } from "lucide-react";
import { env } from "~/env";

interface PDFViewerProps {
  onUploadSuccess?: (url: string) => void;
}

export const PDFViewer = ({
  pdfUrl,
  onUploadSuccess,
}: { pdfUrl: string } & PDFViewerProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    if (file.type !== "application/pdf") {
      setUploadError("Please upload a PDF file");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress("Uploading PDF...");

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/upload-pdf`, {
        method: "POST",
        body: formData,
      });

      // Log the raw response for debugging
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload PDF");
      }

      setUploadProgress("Processing PDF...");

      if (!data.url) {
        throw new Error("No URL received from server");
      }

      // Call the success callback with the S3 URL
      onUploadSuccess?.(data.url);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload PDF"
      );
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  const handleRetry = () => {
    setUploadError(null);
    setIsUploading(false);
  };

  return (
    <div className="w-full h-screen flex flex-row justify-center">
      {pdfUrl === "" && (
        <div className="flex flex-col mx-auto justify-center items-center w-full max-h-screen">
          {isUploading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-neutral-600 dark:text-neutral-300">
                {uploadProgress}
              </p>
            </div>
          ) : (
            <>
              <FileUpload onChange={handleFileUpload} />
              {uploadError && (
                <div className="mt-4 flex flex-col items-center">
                  <p className="text-red-500 text-sm">{uploadError}</p>
                  <button
                    onClick={handleRetry}
                    className="mt-2 text-blue-500 text-sm hover:text-blue-600"
                  >
                    Try again
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {!!pdfUrl && (
        <iframe
          src={pdfUrl + "#toolbar=0"}
          className="w-full h-full"
          title="PDF Viewer"
        />
      )}
    </div>
  );
};

export default PDFViewer;