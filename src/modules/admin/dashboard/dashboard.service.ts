import prisma from "../../../config/database.js";

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
      prisma.user.count({ where: { role: "PASSENGER" } }),
      prisma.user.count({ where: { role: "DRIVER" } }),
      prisma.ride.count(),
      prisma.ride.count({ where: { status: "COMPLETED" } }),
      prisma.ride.count({ where: { status: "CANCELLED" } }),
      prisma.ride.count({ where: { status: "ONGOING" } }),
      prisma.ride.count({ where: { status: "SCHEDULED" } }),
      prisma.booking.count(),
      prisma.document.count({
        where: { OR: [{ rcStatus: "PENDING" }, { licenceStatus: "PENDING" }] },
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
