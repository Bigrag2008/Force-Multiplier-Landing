import React from "react";
import Section from "@/components/ui/Section";
import { Award, Briefcase, Book } from "lucide-react";

const Instructor: React.FC = () => {
    return (
        <Section bg="white">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                {/* Placeholder Photo */}
                <div className="order-2 md:order-1 relative">
                    <div className="absolute top-4 left-4 w-full h-full border-2 border-gold-500 rounded-lg z-0 translate-x-4 translate-y-4"></div>
                    <div className="relative z-10 bg-navy-100 rounded-lg aspect-[3/4] flex items-center justify-center overflow-hidden shadow-lg">
                        <span className="text-6xl">👤</span>
                        <div className="absolute bottom-0 w-full bg-navy-900/80 p-4 text-white text-center backdrop-blur-sm">
                            <p className="font-bold">Your Instructor</p>
                            <p className="text-xs text-gold-500 uppercase tracking-widest">Force Multiplier Founder</p>
                        </div>
                    </div>
                </div>

                <div className="order-1 md:order-2">
                    <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
                        Who Created Force Multiplier?
                    </h2>
                    <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                        <p>
                            Force Multiplier was created by [Your Name], an expert in administrative law and settling workplace disputes.
                        </p>
                        <p>
                            After seeing countless employees lose winnable cases due to lack of knowledge, I built this comprehensive training system to level the playing field.
                        </p>
                        <p>
                            My mission is simple: Make regulatory tactics accessible to individuals who can't afford expensive lawyers but deserve justice.
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <Briefcase className="w-5 h-5 text-gold-500" />
                            <span className="font-bold text-navy-900">Former [Relevant Role]</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Award className="w-5 h-5 text-gold-500" />
                            <span className="font-bold text-navy-900">[X Years] Experience</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Book className="w-5 h-5 text-gold-500" />
                            <span className="font-bold text-navy-900">Author of [Book/Guide]</span>
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
};

export default Instructor;
