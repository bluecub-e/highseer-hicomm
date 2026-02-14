
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Debugging Withdrawal...");

    // 1. Create a dummy user
    const user = await prisma.user.create({
        data: {
            username: "debug_user_" + Date.now(),
            password: "password",
            nickname: "DebugUser",
        },
    });
    console.log("Created debug user:", user.id);

    // 2. Create a dummy post
    const post = await prisma.post.create({
        data: {
            title: "Debug Post",
            content: "Content",
            authorId: user.id,
        },
    });
    console.log("Created debug post:", post.id);

    // 3. Try to delete user
    try {
        await prisma.user.delete({
            where: { id: user.id },
        });
        console.log("SUCCESS: User deleted. Post should have authorId = null.");

        // Verify post
        const updatedPost = await prisma.post.findUnique({ where: { id: post.id } });
        console.log("Post authorId:", updatedPost?.authorId);

    } catch (e: any) {
        console.error("FAILURE: Could not delete user.");
        console.error("Error code:", e.code);
        console.error("Error message:", e.message);
    } finally {
        // Cleanup post
        await prisma.post.deleteMany({ where: { title: "Debug Post" } });
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
