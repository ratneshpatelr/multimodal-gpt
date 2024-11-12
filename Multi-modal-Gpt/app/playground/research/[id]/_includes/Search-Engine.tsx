"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { env } from "~/env";

export default function ResearchSearch() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [similarDocuments, setSimilarDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setResponse("");
    setSimilarDocuments([]);

    try {
      const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/research`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await res.json();
      setResponse(data.response);
      setSimilarDocuments(data.similarDocuments);
    } catch (err) {
      setError("An error occurred while fetching the data. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
    
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your research query"
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {response && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Research Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{response}</p>
          </CardContent>
        </Card>
      )}

      {similarDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Similar Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5">
              {similarDocuments.map((doc, index) => (
                <li key={index} className="mb-2">
                  {doc.pageContent}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
