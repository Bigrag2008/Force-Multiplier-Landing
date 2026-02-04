import React from "react";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

const FinalCTA: React.FC = () => {
    return (
        <Section bg="navy-dark" className="text-center">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">
                    Ready to Fight Back?
                </h2>
                <p className="text-xl md:text-2xl text-gray-300 mb-8">
                    Join <span className="text-gold-500 font-bold">300+ students</span> learning to win $40K-$60K settlements without hiring a lawyer.
                </p>

                <Link href="https://forcemultiplier.teachable.com/purchase" target="_blank">
                    <Button variant="primary" size="xl" className="w-full md:w-auto px-12 py-5 text-xl shadow-gold-500/20 shadow-xl mb-8">
                        Enroll in Force Multiplier - $497
                    </Button>
                </Link>

                <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-gold-500" />
                        <span>30-Day Money-Back Guarantee</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-gold-500" />
                        <span>Instant Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-gold-500" />
                        <span>Lifetime Updates</span>
                    </div>
                </div>
            </div>
        </Section>
    );
};

export default FinalCTA;
