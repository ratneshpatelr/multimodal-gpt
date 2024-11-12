import type { Request, Response } from "express";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { ChatGroq } from "@langchain/groq";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { vectorStore } from "../lib/vector-store-initialzation";

const tools = [new DuckDuckGoSearch(), new WikipediaQueryRun()];
const textSplitter = new CharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 0,
});

const initializeAgent = async () => {
  const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    modelName: "gemma2-9b-it",
    streaming: true,
    // Add temperature and maxTokens to help control response
    temperature: 0.7,
    maxTokens: 1000,
    
  });

  return await initializeAgentExecutorWithOptions(tools, llm, {
    agentType: "zero-shot-react-description",
    handleParsingErrors: true,
    // Add maxIterations to control the number of steps
    maxIterations: 4,
    // Add early stopping options
    earlyStoppingMethod: "generate",
    // Add verbose logging for debugging
    verbose: false,
  });
};

export const ResearchController = async (req: Request, res: Response) => {
  const { prompt } = req.body;
  console.log("Prompt:", prompt);

  if (!prompt) {
    return res.status(400).json({
      error: "Missing Prompt",
    });
  }

  try {
    const chunks = await textSplitter.splitText(prompt);

    // Add chunks to vector store with error handling
    try {
      await vectorStore.addDocuments(
        chunks.map((chunk) => ({
          pageContent: chunk,
          metadata: { source: "user_query" },
        }))
      );
    } catch (vectorStoreError) {
      console.error("Vector store error:", vectorStoreError);
      // Continue execution even if vector store fails
    }

    let similarDocs: any[] = [];
    try {
      similarDocs = await vectorStore.similaritySearch(prompt, 2);
    } catch (searchError) {
      console.error("Similarity search error:", searchError);
      // Continue with empty similar docs if search fails
    }

    const context = similarDocs.map((doc) => doc.pageContent).join("\n");

    // Initialize agent with timeout
    const agent = await initializeAgent();

    // Add timeout to agent execution
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Agent execution timed out")), 30000); // 30 second timeout
    });

    const agentPromise = agent._call({
      input: prompt,
      context: context,
    });

    const response = await Promise.race([agentPromise, timeoutPromise]).catch(
      (error) => {
        if (error.message === "Agent execution timed out") {
          return {
            output:
              "Research took too long to complete. Please try a more specific query.",
          };
        }
        if (error.message.includes("max iterations")) {
          return {
            output:
              "The research was too complex. Please break down your query into smaller parts.",
          };
        }
        throw error; // Re-throw other errors
      }
    );

    res.status(200).json({
      // @ts-ignore
      response: response.output,
      similarDocuments: similarDocs,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      error:error
    });
  }
};
