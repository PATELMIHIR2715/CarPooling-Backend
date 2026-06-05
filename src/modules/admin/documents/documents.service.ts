import prisma from "../../../config/database.js";
import {
  APPROVED,
  LICENCE_DOCUMENT,
  PENDING,
  RC_DOCUMENT,
  REJECTED,
} from "../../../constants/labels.js";
import type { TDocumentStatus } from "../../../constants/types.js";
import {
  buildFilterQuery,
  buildPaginationMeta,
  type FilterInput,
} from "../../../utils/buildquery.utils.js";

class DocumentsService {
  async getDocuments(input: FilterInput) {
    const query = buildFilterQuery(input);

    const [documents, total] = await prisma.$transaction([
      prisma.document.findMany({
        ...query,
        include: {
          user: {
            select: { name: true, email: true, phone: true },
          },
        },
      }),
      prisma.document.count({ where: query.where }),
    ]);

    const page = input.pagination?.page || 1;
    const limit = input.pagination?.limit || 10;

    return {
      data: documents,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async updateDocumentStatus(
    documentId: string,
    type: typeof RC_DOCUMENT | typeof LICENCE_DOCUMENT,
    status: TDocumentStatus
  ) {
    const updateData =
      type === RC_DOCUMENT ? { rcStatus: status } : { licenceStatus: status };

    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: updateData,
    });
    const pendingDocument = await prisma.document.count({
      where: {
        id: documentId,
        OR: [
          { rcStatus: { in: [PENDING, REJECTED] } },
          { licenceStatus: { in: [PENDING, REJECTED] } },
        ],
      },
    });

    if (pendingDocument === 0) {
      await prisma.user.update({
        where: { id: updatedDocument.userId },
        data: { verified: true },
      });
      const document = await prisma.document.update({
        where: { id: documentId },
        data: { status: APPROVED },
      });
      return document;
    }

    return updatedDocument;
  }
}

export default new DocumentsService();
