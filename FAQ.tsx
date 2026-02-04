import React from "react";
import Section from "@/components/ui/Section";
import Accordion from "@/components/ui/Accordion";

const FAQ: React.FC = () => {
    const faqItems = [
        {
            question: "Do I need a lawyer to use this system?",
            answer: "No. The tactics in Force Multiplier are designed for individuals to use without legal representation. EEOC, DOL, and OSHA are free government agencies that investigate on your behalf. A lawyer can help during settlement negotiation, but it's not required."
        },
        {
            question: "What if my employer has mandatory arbitration?",
            answer: "EEOC complaints bypass arbitration clauses. You can file with EEOC even if you signed an arbitration agreement. We cover this extensively in Module 3."
        },
        {
            question: "Can I file EEOC while still employed?",
            answer: "Yes, but most students wait until after termination for strategic reasons (leverage). Filing while employed can lead to retaliation (though retaliation itself is illegal). Module 3 covers timing strategy."
        },
        {
            question: "What if I don't have witnesses or strong evidence?",
            answer: "That's why Module 2 teaches the 5-Tier Evidence System. You'll learn how to build Tier 1-2 evidence systematically. Even cases with weak initial evidence can win with proper strategy and documentation."
        },
        {
            question: "How long does it take to win a settlement?",
            answer: "Typical timeline: 3-6 months from EEOC filing to settlement check. Some settle faster (30-60 days with timeline pressure), others take 12-18 months if the employer fights."
        },
        {
            question: "Is this legal? Am I gaming the system?",
            answer: "100% legal. You're using systems that social movements built over 180 years to enforce your workplace rights. Module 1, Lesson 4 covers the Three Red Lines—ethical boundaries that keep tactics legal and moral."
        },
        {
            question: "What's your refund policy?",
            answer: "30-day money-back guarantee. If you're not satisfied for any reason within 30 days, email us for a full refund. No questions asked."
        }
    ];

    return (
        <Section bg="white" id="faq">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-4">
                    Frequently Asked Questions
                </h2>
            </div>
            <Accordion items={faqItems} />
        </Section>
    );
};

export default FAQ;
