import { Router } from "express";
import { PdfUploadController } from "../controller/upload-pdf.controller";
import { upload } from "../config/multer-config";

const PdfRouter = Router()
// @ts-ignore
PdfRouter.post("/upload-pdf",upload.single("pdf"),PdfUploadController)

export default PdfRouter