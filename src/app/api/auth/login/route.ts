import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: "아이디와 비밀번호를 입력해주세요." },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            return NextResponse.json(
                { error: "아이디 또는 비밀번호가 올바르지 않습니다." },
                { status: 401 }
            );
        }

        const valid = await verifyPassword(password, user.password);
        if (!valid) {
            return NextResponse.json(
                { error: "아이디 또는 비밀번호가 올바르지 않습니다." },
                { status: 401 }
            );
        }

        const token = await createToken(user.id);
        await setAuthCookie(token);

        return NextResponse.json({
            user: {
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                isAdmin: user.isAdmin,
            },
        });
    } catch {
        return NextResponse.json(
            { error: "로그인 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
