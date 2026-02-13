import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    const adminId = process.env.INITIAL_ADMIN_ID || "admin";
    const adminPw = process.env.INITIAL_ADMIN_PW || "admin1234";

    const admin = await prisma.user.upsert({
        where: { username: adminId },
        update: {},
        create: {
            username: adminId,
            password: await bcrypt.hash(adminPw, 10),
            nickname: "관리자",
            isAdmin: true,
        },
    });

    console.log("✅ Seed complete!");
    console.log(`   - Admin user ready: ${admin.username}`);

    if (!process.env.INITIAL_ADMIN_ID) {
        console.log("   ⚠️  Using default credentials (admin / admin1234).");
        console.log("      Set INITIAL_ADMIN_ID and INITIAL_ADMIN_PW in .env to secure your admin account.");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
