import { Router } from "express";
import documentsController from "./documents.controller.js";
import { authenticate, authorize } from "../../auth/auth.middleware.js";
import { ADMIN_ROLE } from "../../../constants/labels.js";
import {
  DOCUMENTID,
  DOCUMENTS,
  STATUS,
  TYPE,
} from "../../../constants/routes.js";

const router = Router();

router.post(
  DOCUMENTS,
  authenticate,
  authorize([ADMIN_ROLE]),
  documentsController.getDocuments
);

router.put(
  `${DOCUMENTID}${TYPE}${STATUS}`,
  authenticate,
  authorize([ADMIN_ROLE]),
  documentsController.updateDocumentStatus
);

export default router;
