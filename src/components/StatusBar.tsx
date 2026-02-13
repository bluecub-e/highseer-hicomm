"use client";

import { useState, useEffect } from "react";

export default function StatusBar({ nickname }: { nickname: string | null }) {
    const [time, setTime] = useState("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, "0");
            const m = String(now.getMinutes()).padStart(2, "0");
            const s = String(now.getSeconds()).padStart(2, "0");
            setTime(`${h}:${m}:${s}`);
        };
        updateTime();
        const id = setInterval(updateTime, 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <header className="flex items-center justify-between px-3 py-1.5 bg-terminal-bg-dark border-b-2 border-terminal-border text-sm select-none shrink-0">
            <span className="text-terminal-cyan font-bold tracking-wider">
                ★ HiComm — (주)하이시어 ★
            </span>
            <div className="flex items-center gap-4 text-terminal-gray">
                <span className="hidden sm:inline">
                    접속중 │ {nickname ? (
                        <span className="text-terminal-highlight">{nickname}</span>
                    ) : (
                        "손님"
                    )}
                </span>
                <span className="text-terminal-highlight">{time}</span>
            </div>
        </header>
    );
}
