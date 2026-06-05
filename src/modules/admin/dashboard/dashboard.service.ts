import prisma from "../../../config/database.js";
import {
  CANCELLED,
  COMPLETED,
  DRIVER_ROLE,
  ONGOING,
  PASSENGER_ROLE,
  PENDING,
  SCHEDULED,
} from "../../../constants/labels.js";

class DashboardService {
  async getDashboardData() {
    const [
      totalUsers,
      totalPassengers,
      totalDrivers,
      totalRides,
      completedRides,
      cancelledRides,
      ongoingRides,
      sheduledRides,
      totalBookings,
      pendingDocuments,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { role: PASSENGER_ROLE } }),
      prisma.user.count({ where: { role: DRIVER_ROLE } }),
      prisma.ride.count(),
      prisma.ride.count({ where: { status: COMPLETED } }),
      prisma.ride.count({ where: { status: CANCELLED } }),
      prisma.ride.count({ where: { status: ONGOING } }),
      prisma.ride.count({ where: { status: SCHEDULED } }),
      prisma.booking.count(),
      prisma.document.count({
        where: { OR: [{ rcStatus: PENDING }, { licenceStatus: PENDING }] },
      }),
    ]);
    return {
      totalUsers,
      totalPassengers,
      totalDrivers,
      totalRides,
      completedRides,
      cancelledRides,
      ongoingRides,
      sheduledRides,
      totalBookings,
      pendingDocuments,
    };
  }
}

export default new DashboardService();
