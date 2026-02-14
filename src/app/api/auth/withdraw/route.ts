import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, removeAuthCookie } from "@/lib/auth";

export async function DELETE(request: Request) {
    try {
        const user = await getSession();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Delete user
        // Due to 'onDelete: SetNull' in schema, posts and comments will remain
        // but authorId will become null.
        await prisma.user.delete({
            where: { id: user.id },
        });

        // Clear session cookie
        await removeAuthCookie();

        return NextResponse.json({ success: true, message: "회원 탈퇴가 완료되었습니다." });
    } catch (error) {
        console.error("Withdraw error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
