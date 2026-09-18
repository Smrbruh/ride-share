import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const vehicleTypeEconomy = await prisma.vehicleType.create({
    data: { typeName: "Economy", baseFare: 300, perKmRate: 60 }
  });
  const vehicleTypeComfort = await prisma.vehicleType.create({
    data: { typeName: "Comfort", baseFare: 500, perKmRate: 90 }
  });
  await prisma.vehicleType.create({
    data: { typeName: "Van", baseFare: 800, perKmRate: 120 }
  });

  const driver1 = await prisma.driver.create({
    data: {
      firstName: "Almas",
      lastName: "Serik",
      email: "almas.serik@ride.local",
      phoneNumber: "+77051112233",
      licenseNumber: "LIC-100234",
      licenseExpiryDate: new Date("2027-06-01"),
      hireDate: new Date("2024-01-15"),
      status: "active",
      passwordHash
    }
  });
  const driver2 = await prisma.driver.create({
    data: {
      firstName: "Dana",
      lastName: "Bekova",
      email: "dana.bekova@ride.local",
      phoneNumber: "+77052223344",
      licenseNumber: "LIC-100987",
      licenseExpiryDate: new Date("2026-11-01"),
      hireDate: new Date("2023-09-01"),
      status: "active",
      passwordHash
    }
  });

  await prisma.vehicle.create({
    data: {
      driverId: driver1.id,
      vehicleTypeId: vehicleTypeComfort.id,
      plateNumber: "777KZH01",
      model: "Toyota Camry",
      color: "White",
      manufactureYear: 2022
    }
  });
  await prisma.vehicle.create({
    data: {
      driverId: driver2.id,
      vehicleTypeId: vehicleTypeEconomy.id,
      plateNumber: "555ABK02",
      model: "Hyundai Accent",
      color: "Silver",
      manufactureYear: 2021
    }
  });

  const locationA = await prisma.location.create({
    data: { address: "Kabanbay Batyr 53", city: "Astana", latitude: 51.128, longitude: 71.430 }
  });
  const locationB = await prisma.location.create({
    data: { address: "Dostyk 12", city: "Astana", latitude: 51.160, longitude: 71.470 }
  });
  const locationC = await prisma.location.create({
    data: { address: "Turan Avenue 5", city: "Astana", latitude: 51.090, longitude: 71.400 }
  });

  const distanceKm1 = 8.5;
  const fare1 = Number(vehicleTypeComfort.baseFare) + distanceKm1 * Number(vehicleTypeComfort.perKmRate);
  const ride1 = await prisma.ride.create({
    data: {
      driverId: driver1.id,
      pickupLocationId: locationA.id,
      dropoffLocationId: locationB.id,
      startTime: new Date("2026-09-15T09:00:00Z"),
      distanceKm: distanceKm1,
      status: "scheduled",
      fareAmount: fare1
    }
  });

  const distanceKm2 = 5.2;
  const fare2 = Number(vehicleTypeEconomy.baseFare) + distanceKm2 * Number(vehicleTypeEconomy.perKmRate);
  await prisma.ride.create({
    data: {
      driverId: driver2.id,
      pickupLocationId: locationC.id,
      dropoffLocationId: locationA.id,
      startTime: new Date("2026-09-15T10:30:00Z"),
      distanceKm: distanceKm2,
      status: "scheduled",
      fareAmount: fare2
    }
  });

  const user1 = await prisma.user.create({
    data: {
      firstName: "Bakdaulet",
      lastName: "Yerzhanuly",
      email: "bakdaulet@example.com",
      phoneNumber: "+77051230001",
      passwordHash,
      status: "active"
    }
  });
  const user2 = await prisma.user.create({
    data: {
      firstName: "Aigerim",
      lastName: "Nurlanovna",
      email: "aigerim@example.com",
      phoneNumber: "+77051230002",
      passwordHash,
      status: "active"
    }
  });

  const promo = await prisma.promoCode.create({
    data: {
      code: "WELCOME10",
      discountPercent: 10,
      validFrom: new Date("2026-01-01"),
      validTo: new Date("2026-12-31"),
      maxUsage: 100
    }
  });

  const booking1 = await prisma.booking.create({
    data: {
      rideId: ride1.id,
      userId: user1.id,
      seatCount: 1,
      status: "confirmed"
    }
  });

  await prisma.userPromo.create({
    data: { userId: user1.id, promoId: promo.id }
  });

  const discountedAmount = Number(fare1) * (1 - Number(promo.discountPercent) / 100);
  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      amount: discountedAmount,
      paymentMethod: "card",
      paymentStatus: "paid",
      paymentDate: new Date()
    }
  });

  await prisma.admin.create({
    data: {
      firstName: "System",
      lastName: "Admin",
      email: "admin@ride.local",
      passwordHash,
      role: "superadmin"
    }
  });

  console.log("Seed complete", { user2Id: user2.id });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
