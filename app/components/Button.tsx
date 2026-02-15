import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline";
    size?: "sm" | "md" | "lg" | "xl";
    children: React.ReactNode;
}

// Simple utility for classes if not using clsx/tailwind-merge yet, 
// but usually we want a utility. I'll implement a basic one or assume it exists.
// Since I haven't created lib/utils, I'll define it here or create lib/utils first.
// I'll create lib/utils first in the next step. For now I'll just use template literals.

const Button: React.FC<ButtonProps> = ({
    className = "",
    variant = "primary",
    size = "md",
    children,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-gold-500 text-navy-900 hover:bg-gold-400 focus:ring-gold-500 shadow-md",
        secondary: "bg-navy-900 text-white hover:bg-navy-800 focus:ring-navy-900 shadow-md",
        outline: "border-2 border-navy-900 text-navy-900 hover:bg-navy-50 focus:ring-navy-900"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm rounded-md",
        md: "px-6 py-3 text-base rounded-lg",
        lg: "px-8 py-4 text-lg rounded-xl",
        xl: "px-10 py-5 text-xl rounded-xl font-bold"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
