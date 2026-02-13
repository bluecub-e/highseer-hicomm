import "dotenv/config";
import { PrismaClient } from "@prisma/client";

import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
    console.log("📤 Exporting Highseer HiComm Data...");

    // Fetch posts with comments and authors
    // We explicitly select fields to AVOID exporting sensitive data like passwords/emails if they existed
    const posts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            author: {
                select: {
                    id: true,
                    nickname: true, // Only nickname is public
                    username: false, // Don't export username (security/privacy preference, though usually less sensitive)
                    isAdmin: true
                }
            },
            comments: {
                orderBy: { createdAt: "asc" },
                include: {
                    author: {
                        select: {
                            id: true,
                            nickname: true
                        }
                    }
                }
            }
        }
    });

    // Transform data if needed (currently structure is fine, just confirming format)
    const exportData = posts.map(post => ({
        id: post.id,
        type: "post",
        title: post.title,
        content: post.content,
        views: post.views,
        likes: 0, // Placeholder if needed for sim
        isNotice: post.isNotice,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: {
            id: post.author.id,
            nickname: post.author.nickname,
            isAdmin: post.author.isAdmin
        },
        comments: post.comments.map(comment => ({
            id: comment.id,
            type: "comment",
            content: comment.content,
            createdAt: comment.createdAt,
            author: {
                id: comment.author.id,
                nickname: comment.author.nickname
            }
        }))
    }));

    const exportDir = path.join(process.cwd(), "exports");
    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir);
    }

    const filename = `hicomm_data_${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.json`;
    const filePath = path.join(exportDir, filename);

    // Also save as 'latest.json' for easier access
    const latestPath = path.join(exportDir, "community_data_latest.json");

    const jsonString = JSON.stringify(exportData, null, 2);

    fs.writeFileSync(filePath, jsonString);
    fs.writeFileSync(latestPath, jsonString);

    console.log(`✅ Data exported successfully!`);
    console.log(`   - Posts: ${posts.length}`);
    console.log(`   - Comments: ${posts.reduce((acc, p) => acc + p.comments.length, 0)}`);
    console.log(`   - Details: Exported to ./exports/${filename}`);
    console.log(`   - Latest:  ./exports/community_data_latest.json`);
}

main()
    .catch((e) => {
        console.error("❌ Export failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
