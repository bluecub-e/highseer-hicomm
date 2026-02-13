import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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
    const commentId = parseInt(id);

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
        return NextResponse.json(
            { error: "댓글을 찾을 수 없습니다." },
            { status: 404 }
        );
    }

    // Only author or admin can delete
    if (comment.authorId !== user.id && !user.isAdmin) {
        return NextResponse.json(
            { error: "삭제 권한이 없습니다." },
            { status: 403 }
        );
    }

    await prisma.comment.delete({ where: { id: commentId } });

    return NextResponse.json({ success: true });
}
