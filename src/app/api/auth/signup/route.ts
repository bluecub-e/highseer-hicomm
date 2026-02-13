import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const { username, password, nickname } = await request.json();

        if (!username || !password || !nickname) {
            return NextResponse.json(
                { error: "아이디, 비밀번호, 닉네임을 모두 입력해주세요." },
                { status: 400 }
            );
        }

        if (username.length < 3 || username.length > 20) {
            return NextResponse.json(
                { error: "아이디는 3~20자로 입력해주세요." },
                { status: 400 }
            );
        }

        if (password.length < 4) {
            return NextResponse.json(
                { error: "비밀번호는 4자 이상 입력해주세요." },
                { status: 400 }
            );
        }

        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) {
            return NextResponse.json(
                { error: "이미 사용 중인 아이디입니다." },
                { status: 409 }
            );
        }

        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: { username, password: hashedPassword, nickname },
        });

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
            { error: "회원가입 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
