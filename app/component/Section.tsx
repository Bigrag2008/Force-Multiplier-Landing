import React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
    container?: boolean; // If true, wraps children in container
    bg?: "white" | "gray" | "navy" | "navy-dark";
}

const Section: React.FC<SectionProps> = ({
    className,
    children,
    container = true,
    bg = "white",
    ...props
}) => {
    const bgStyles = {
        white: "bg-white",
        gray: "bg-gray-50",
        navy: "bg-navy-800",
        "navy-dark": "bg-navy-900",
    };

    const textColors = bg.startsWith("navy") ? "text-white" : "text-navy-900";

    return (
        <section
            className={cn("py-16 md:py-24", bgStyles[bg], textColors, className)}
            {...props}
        >
            {container ? (
                <div className="container mx-auto px-4 md:px-6">
                    {children}
                </div>
            ) : (
                children
            )}
        </section>
    );
};

export default Section;
