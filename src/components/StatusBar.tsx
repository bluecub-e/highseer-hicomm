"use client";

import { useState, useEffect } from "react";

interface StatusBarProps {
    nickname: string | null;
    dimmed: boolean;
    onToggleDimmed: () => void;
}

export default function StatusBar({ nickname, dimmed, onToggleDimmed }: StatusBarProps) {
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
        <header className="flex items-center justify-between px-2 sm:px-3 py-1.5 bg-terminal-bg-dark border-b-2 border-terminal-border text-sm select-none shrink-0">
            <span className="text-terminal-cyan font-bold tracking-wider truncate">
                <span className="hidden sm:inline">★ HiComm — (주)하이시어 ★</span>
                <span className="sm:hidden">★ HiComm ★</span>
            </span>
            <div className="flex items-center gap-2 sm:gap-4 text-terminal-gray shrink-0">
                <button
                    onClick={onToggleDimmed}
                    className="text-base hover:scale-110 transition-transform"
                    title={dimmed ? "밝은 화면" : "어두운 화면"}
                >
                    {dimmed ? "☀️" : "🌙"}
                </button>
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
