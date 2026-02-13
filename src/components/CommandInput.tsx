"use client";

import { useState, useRef, useEffect } from "react";

interface CommandInputProps {
    onCommand: (cmd: string) => void;
    placeholder?: string;
    isAdmin?: boolean;
}

export default function CommandInput({ onCommand, placeholder = "명령어를 입력하세요", isAdmin = false }: CommandInputProps) {
    const [value, setValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = value.trim();
        if (trimmed) {
            onCommand(trimmed);
            setValue("");
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-3 py-2 bg-terminal-bg-dark border-t-2 border-terminal-border shrink-0"
            onClick={() => inputRef.current?.focus()}
        >
            <span className={`font-bold select-none ${isAdmin ? "text-terminal-red" : "text-terminal-green"}`}>
                {isAdmin ? "관리>" : "명령>"}
            </span>
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-terminal-text outline-none font-[inherit] text-base placeholder:text-terminal-darkgray caret-terminal-green"
                autoComplete="off"
                spellCheck={false}
            />
            <span className="text-terminal-green cursor-blink select-none">█</span>
        </form>
    );
}
