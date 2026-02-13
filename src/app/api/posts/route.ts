import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const boardId = searchParams.get("boardId") || "free";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    // Logic: 
    // 1. Get all notices for this board (ignore pagination for notices? or include them?).
    // Actually simpler: just sort by isNotice desc, createdAt desc.
    // Pagination will just cut through them. Notices will appear on page 1.

    const [posts, total] = await Promise.all([
        prisma.post.findMany({
            where: { boardId },
            orderBy: [
                { isNotice: "desc" },
                { createdAt: "desc" }
            ],
            skip,
            take: limit,
            include: {
                author: { select: { nickname: true } },
                _count: { select: { comments: true } },
            },
        }),
        prisma.post.count({ where: { boardId } }),
    ]);

    return NextResponse.json({
        posts: posts.map((p) => ({
            id: p.id,
            title: p.title,
            author: p.author.nickname,
            authorId: p.authorId,
            date: p.createdAt.toISOString().split("T")[0],
            views: p.views,
            isNotice: p.isNotice,
            commentCount: p._count.comments,
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
    });
}

export async function POST(request: Request) {
    const user = await getSession();
    if (!user) {
        return NextResponse.json(
            { error: "로그인이 필요합니다." },
            { status: 401 }
        );
    }

    const { title, content, boardId = "free", isNotice = false } = await request.json();

    if (!title || !content) {
        return NextResponse.json(
            { error: "제목과 내용을 입력해주세요." },
            { status: 400 }
        );
    }

    // Only admin can set isNotice
    const finalIsNotice = user.isAdmin ? isNotice : false;

    const post = await prisma.post.create({
        data: {
            title,
            content,
            boardId,
            authorId: user.id,
            isNotice: finalIsNotice,
        },
        include: {
            author: { select: { nickname: true } },
        },
    });

    return NextResponse.json({
        id: post.id,
        title: post.title,
        content: post.content,
        author: post.author.nickname,
        date: post.createdAt.toISOString().split("T")[0],
        views: post.views,
        isNotice: post.isNotice,
    });
}
