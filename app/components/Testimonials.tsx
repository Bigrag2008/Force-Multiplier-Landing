import React from "react";
import Section from "@/components/ui/Section";
import { Star } from "lucide-react";

const Testimonials: React.FC = () => {
    const testimonials = [
        {
            quote: "I went from feeling powerless to negotiating from a position of strength. The evidence hierarchy alone changed everything. Worth every penny.",
            author: "Sarah K.",
            role: "Retaliation Settlement",
            stars: 5,
        },
        {
            quote: "The settlement math formula is genius. Once I understood the CFO's spreadsheet logic, I knew exactly what to demand. Settled for $52,000.",
            author: "James M.",
            role: "Disability Discrimination",
            stars: 5,
        },
        {
            quote: "Clear, actionable, professional. This isn't theory—it's a proven playbook. I'm currently in settlement negotiations using these exact tactics.",
            author: "Andrea L.",
            role: "Pregnancy Discrimination",
            stars: 5,
        },
    ];

    return (
        <Section bg="gray">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-4">
                    What Students Are Saying
                </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                    <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col h-full">
                        <div className="flex gap-1 mb-4">
                            {[...Array(testimonial.stars)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 text-gold-500 fill-current" />
                            ))}
                        </div>
                        <p className="text-gray-600 mb-6 flex-grow italic leading-relaxed">"{testimonial.quote}"</p>
                        <div className="mt-auto">
                            <div className="font-bold text-navy-900">{testimonial.author}</div>
                            <div className="text-sm text-gray-500">{testimonial.role}</div>
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    );
};

export default Testimonials;
