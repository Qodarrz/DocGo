// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // 1. Buat user dokter
  const doctorUser = await prisma.user.upsert({
    where: { email: "dr.joko@example.com" },
    update: {},
    create: {
      email: "dr.joko@example.com",
      fullName: "Dr. Joko Santoso",
      phone: "081234567890",
      role: "DOCTOR",
      passwordHash: "hashed_password_here", // bisa pakai bcrypt jika mau
      emailVerified: true,
    },
  });

  // 2. Buat data dokter yang terkait dengan user
  const doctor = await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      specialization: "GENERAL",
      licenseNumber: "DOC-12345",
      experienceYear: 5,
      bio: "Dokter umum dengan pengalaman 5 tahun di rumah sakit Jakarta.",
      isActive: true,
    },
  });

  console.log("Doctor user created:", doctorUser);
  console.log("Doctor profile created:", doctor);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
