import React from "react";
import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import { CheckCircle, Clock, FileText } from "lucide-react";
import Link from "next/link";

const Hero: React.FC = () => {
    return (
        <Section bg="navy-dark" className="pt-24 pb-20 md:pt-32 md:pb-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Left Column: Copy */}
                <div className="text-left space-y-6">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight">
                        Win <span className="text-gold-500">$40,000-$60,000</span> Workplace Discrimination Settlements Without Hiring a Lawyer
                    </h1>

                    <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-light">
                        The step-by-step system that turns free government agencies into your legal team—no law degree required.
                    </p>

                    <div className="pt-4 flex flex-col sm:flex-row gap-4">
                        <Link href="https://forcemultiplier.teachable.com/purchase" target="_blank">
                            <Button variant="primary" size="xl" className="w-full sm:w-auto">
                                Enroll Now - $497
                            </Button>
                        </Link>
                    </div>

                    {/* Trust Indicators */}
                    <div className="pt-6 border-t border-navy-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gold-500" />
                            <span>7 Modules • 28 Lessons • 9hr 47min</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gold-500" />
                            <span>Includes 6 Professional Worksheets</span>
                        </div>
                        <div className="flex items-center gap-2 sm:col-span-2">
                            <CheckCircle className="w-4 h-4 text-gold-500" />
                            <span>30-Day Money-Back Guarantee</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Image/Visual */}
                <div className="relative">
                    {/* Decorative Elements */}
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-gold-500/10 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>

                    <div className="relative bg-navy-800 rounded-xl overflow-hidden shadow-2xl border border-navy-700 aspect-[4/3] flex items-center justify-center group">
                        <div className="text-center p-8">
                            <div className="w-20 h-20 bg-navy-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <span className="text-4xl">🎓</span>
                            </div>
                            <p className="text-white font-heading font-semibold text-xl">Force Multiplier System</p>
                            <p className="text-gray-400 mt-2 text-sm">Course Preview / Hero Image</p>
                        </div>
                        {/* Overlay for visual polish */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-navy-900/50 to-transparent pointer-events-none"></div>
                    </div>
                </div>
            </div>
        </Section>
    );
};

export default Hero;
