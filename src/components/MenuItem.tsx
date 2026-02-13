"use client";

interface MenuItemProps {
    number: number | string;
    label: string;
    description?: string;
    onClick: () => void;
    highlight?: boolean;
}

export default function MenuItem({ number, label, description, onClick, highlight = false }: MenuItemProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left py-1 px-2 transition-colors duration-100 rounded-none
        hover:bg-terminal-selection hover:text-terminal-highlight
        focus:bg-terminal-selection focus:text-terminal-highlight focus:outline-none
        ${highlight ? "text-terminal-cyan" : "text-terminal-text"}`}
        >
            <span className="text-terminal-highlight font-bold mr-2">[{number}]</span>
            <span className="font-bold">{label}</span>
            {description && (
                <span className="text-terminal-gray ml-2 text-sm">— {description}</span>
            )}
        </button>
    );
}
