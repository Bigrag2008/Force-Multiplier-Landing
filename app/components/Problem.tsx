import React from "react";
import Section from "./Section";
import { Scale, Users, AlertCircle } from "lucide-react";

const Problem: React.FC = () => {
    return (
        <Section bg="gray">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
                    Facing Workplace Discrimination? <br className="hidden md:block" />
                    The System Is Rigged Against You.
                </h2>
                <p className="text-lg text-navy-800">
                    Most employees give up because they think they can't win without a lawyer. Here is the reality:
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Pain Point 1 */}
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                        <Scale className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-navy-900 mb-3">Lawyers Cost $15k-$50k</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Most employees can't afford legal representation upfront, so discrimination goes unpunished and you walk away with nothing.
                    </p>
                </div>

                {/* Pain Point 2 */}
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                        <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-navy-900 mb-3">HR Protects The Company</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Internal complaints get buried, retaliation happens, and nothing changes. HR is not your friend—they are risk management.
                    </p>
                </div>

                {/* Pain Point 3 */}
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-navy-900 mb-3">You Feel Powerless</h3>
                    <p className="text-gray-600 leading-relaxed">
                        They have unlimited resources and legal teams. You're just one person. Without a system, the odds are stacked against you.
                    </p>
                </div>
            </div>

            <div className="mt-16 text-center">
                <p className="text-xl md:text-2xl font-semibold text-navy-900">
                    But there's a proven system that levels the playing field—and you're about to learn it.
                </p>
            </div>
        </Section>
    );
};

export default Problem;
