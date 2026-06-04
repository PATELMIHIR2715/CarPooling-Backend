import prisma from "../../../config/database.js";
import {
  buildFilterQuery,
  buildPaginationMeta,
  type FilterInput,
} from "../../../utils/buildquery.utils.js";

class AdminTripsService {
  async getAllTrips(filters: FilterInput) {
    const query = buildFilterQuery(filters);
    const [allTrips, total] = await prisma.$transaction([
      prisma.ride.findMany(query),
      prisma.ride.count({ where: query.where }),
    ]);
    const page = filters.pagination?.page || 1;
    const limit = filters.pagination?.limit || 10;

    return { data: allTrips, meta: buildPaginationMeta(total, page, limit) };
  }
}

export default new AdminTripsService();
