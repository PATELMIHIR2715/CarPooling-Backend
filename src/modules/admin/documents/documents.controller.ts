import type { Response } from "express";
import documentsService from "./documents.service.js";
import { errorResponse } from "../../../utils/error.utils.js";

class DocumentsController {
  async getDocuments(req: any, res: Response) {
    try {
      const documents = await documentsService.getDocuments(req.body);
      res.status(200).json(documents);
    } catch (error) {
      errorResponse(error, res);
    }
  }

  async updateDocumentStatus(req: any, res: Response) {
    try {
      const documentId = req.params.documentId;
      const type = req.params.type;
      const status = req.params.status;
      const updatedDocument = await documentsService.updateDocumentStatus(
        documentId,
        type,
        status
      );
      res.status(200).json(updatedDocument);
    } catch (error) {
      errorResponse(error, res);
    }
  }
}

export default new DocumentsController();
