import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const postId = parseInt(searchParams.get("postId") || "0");

    if (!postId) {
        return NextResponse.json({ error: "postId가 필요합니다." }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
        where: { postId },
        orderBy: { createdAt: "asc" },
        include: {
            author: { select: { id: true, nickname: true } },
        },
    });

    return NextResponse.json({
        comments: comments.map((c) => ({
            id: c.id,
            content: c.content,
            author: c.author.nickname,
            authorId: c.author.id,
            date: c.createdAt.toISOString().split("T")[0],
        })),
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

    const { postId, content } = await request.json();

    if (!postId || !content) {
        return NextResponse.json(
            { error: "댓글 내용을 입력해주세요." },
            { status: 400 }
        );
    }

    const comment = await prisma.comment.create({
        data: {
            content,
            postId,
            authorId: user.id,
        },
        include: {
            author: { select: { id: true, nickname: true } },
        },
    });

    return NextResponse.json({
        id: comment.id,
        content: comment.content,
        author: comment.author.nickname,
        authorId: comment.author.id,
        date: comment.createdAt.toISOString().split("T")[0],
    });
}
