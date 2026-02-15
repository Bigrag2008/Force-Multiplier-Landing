"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AccordionItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ question, answer, isOpen, onClick }) => {
    return (
        <div className="border-b border-gray-200 last:border-0">
            <button
                className="w-full flex justify-between items-center py-5 text-left focus:outline-none"
                onClick={onClick}
            >
                <span className="text-lg font-semibold font-heading text-navy-900 pr-8">
                    {question}
                </span>
                <span className={cn("text-gold-500 transition-transform duration-300", isOpen ? "transform rotate-180" : "")}>
                    <ChevronDown className="w-6 h-6" />
                </span>
            </button>
            <div
                className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-96 opacity-100 pb-5" : "max-h-0 opacity-0"
                )}
            >
                <div className="text-navy-800 leading-relaxed">
                    {answer}
                </div>
            </div>
        </div>
    );
};

interface AccordionProps {
    items: { question: string; answer: string }[];
    className?: string;
}

const Accordion: React.FC<AccordionProps> = ({ items, className }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0); // First one open by default

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className={cn("w-full max-w-3xl mx-auto divide-y divide-gray-200", className)}>
            {items.map((item, index) => (
                <AccordionItem
                    key={index}
                    question={item.question}
                    answer={item.answer}
                    isOpen={openIndex === index}
                    onClick={() => handleToggle(index)}
                />
            ))}
        </div>
    );
};

export default Accordion;
