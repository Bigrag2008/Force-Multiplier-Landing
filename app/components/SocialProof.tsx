import React from "react";
import Section from "./Section";
import { Users, TrendingUp, ShieldCheck } from "lucide-react";

const SocialProof: React.FC = () => {
    return (
        <div className="bg-gold-50 bg-opacity-30 border-b border-gray-100">
            <Section className="py-8" bg="white" container>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 text-center md:text-left">
                    <p className="text-lg font-semibold text-navy-900 max-w-sm">
                        Join <span className="text-gold-600">300+ students</span> learning to fight back—and win.
                    </p>

                    <div className="flex flex-wrap justify-center md:justify-end gap-6 md:gap-12 opacity-80">
                        <div className="flex items-center gap-2 text-navy-800 text-sm font-medium">
                            <Users className="w-5 h-5 text-gold-500" />
                            <span>Active Community</span>
                        </div>
                        <div className="flex items-center gap-2 text-navy-800 text-sm font-medium">
                            <TrendingUp className="w-5 h-5 text-gold-500" />
                            <span>Proven Results</span>
                        </div>
                        <div className="flex items-center gap-2 text-navy-800 text-sm font-medium">
                            <ShieldCheck className="w-5 h-5 text-gold-500" />
                            <span>Legal Strategy</span>
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    );
};

export default SocialProof;
