import type { Response } from "express";
import documentsService from "./documents.service.js";
import {
  successResponse,
  errorResponseStandard,
} from "../../../utils/response.utils.js";

class DocumentsController {
  async getDocuments(req: any, res: Response) {
    try {
      const documents = await documentsService.getDocuments(req.body);
      successResponse(res, documents, 200);
    } catch (error) {
      errorResponseStandard(error, res);
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
      successResponse(res, updatedDocument, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }
}

export default new DocumentsController();
