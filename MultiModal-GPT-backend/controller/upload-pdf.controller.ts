import { Request, Response } from "express";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { vectorStore } from "../lib/vector-store-initialzation";
import s3 from "../config/s3.config";
import * as fs from "fs";

export const PdfUploadController = async (req: Request, res: Response) => {

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No PDF file uploaded",
    });
  }

  const pdfPath = req.file.path;

  try {
    // 1. Upload to S3

     if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
       throw new Error("AWS credentials are not properly configured");
     }

    const fileName = `${uuidv4()}-${req.file.originalname}`;
    const s3Key = `uploads/${fileName}`;

    const uploadParams = {
      Bucket: "multimodal-gpt",
      Key: s3Key,
      Body: fs.readFileSync(pdfPath),
      ContentType: req.file.mimetype,
    };

    await s3.send(new PutObjectCommand(uploadParams));
    const fileUrl = `https://multimodal-gpt.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    // 2. Process for vector store
    const loader = new PDFLoader(pdfPath);
    const docs = await loader.load();

    const textsplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await textsplitter.splitDocuments(docs);
    const docsWithMetaData = splitDocs.map((doc) => ({
      ...doc,
      metadata: {
        ...doc.metadata,
        source: req.file?.originalname,
        url: fileUrl,
      },
    }));

    await vectorStore.addDocuments(docsWithMetaData);

    // 3. Clean up local file
    fs.unlink(pdfPath, (err) => {
      if (err) {
        console.error("Error deleting the PDF file:", err);
      }
    });

    // 4. Send success response with URL
    return res.status(200).json({
      success: true,
      message: "PDF file processed successfully",
      url: fileUrl,
    });
  } catch (error) {
    console.error("Upload/processing error:", error);

    // Clean up on error
    fs.unlink(pdfPath, () => {});

    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the PDF file",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
