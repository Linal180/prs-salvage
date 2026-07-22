import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@prs.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "Admin@12345";

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "ADMIN",
      status: "APPROVED",
      displayName: "Platform Administrator",
      policyAcceptedAt: new Date(),
      approvedAt: new Date(),
      emailVerifiedAt: new Date(),
    },
    create: {
      email,
      passwordHash,
      role: "ADMIN",
      status: "APPROVED",
      displayName: "Platform Administrator",
      policyAcceptedAt: new Date(),
      approvedAt: new Date(),
      emailVerifiedAt: new Date(),
    },
  });
  console.log("Admin ready:");
  console.log(`  email:    ${admin.email}`);
  console.log(`  password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
