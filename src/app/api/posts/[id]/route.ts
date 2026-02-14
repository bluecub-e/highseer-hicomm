import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
        return NextResponse.json({ error: "잘못된 게시글 ID" }, { status: 400 });
    }

    // Increment view count
    const post = await prisma.post.update({
        where: { id: postId },
        data: { views: { increment: 1 } },
        include: {
            author: { select: { id: true, nickname: true } },
            comments: {
                orderBy: { createdAt: "asc" },
                include: {
                    author: { select: { id: true, nickname: true } },
                },
            },
        },
    });

    if (!post) {
        return NextResponse.json(
            { error: "게시글을 찾을 수 없습니다." },
            { status: 404 }
        );
    }

    return NextResponse.json({
        id: post.id,
        title: post.title,
        content: post.content,
        author: post.author?.nickname || "탈퇴한 회원",
        authorId: post.author?.id || -1,
        date: post.createdAt.toISOString().split("T")[0],
        views: post.views,
        isNotice: post.isNotice,
        comments: post.comments.map((c) => ({
            id: c.id,
            content: c.content,
            author: c.author?.nickname || "탈퇴한 회원",
            authorId: c.author?.id || -1,
            date: c.createdAt.toISOString().split("T")[0],
        })),
    });
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getSession();
    if (!user) {
        return NextResponse.json(
            { error: "로그인이 필요합니다." },
            { status: 401 }
        );
    }

    const { id } = await params;
    const postId = parseInt(id);

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
        return NextResponse.json(
            { error: "게시글을 찾을 수 없습니다." },
            { status: 404 }
        );
    }

    // Only author or admin can delete
    if (post.authorId !== user.id && !user.isAdmin) {
        return NextResponse.json(
            { error: "삭제 권한이 없습니다." },
            { status: 403 }
        );
    }

    await prisma.post.delete({ where: { id: postId } });

    return NextResponse.json({ success: true });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getSession();
    if (!user || !user.isAdmin) {
        return NextResponse.json(
            { error: "관리자 권한이 필요합니다." },
            { status: 403 }
        );
    }

    const { id } = await params;
    const postId = parseInt(id);
    const { isNotice } = await request.json();

    const post = await prisma.post.update({
        where: { id: postId },
        data: { isNotice },
    });

    return NextResponse.json({ success: true, isNotice: post.isNotice });
}
