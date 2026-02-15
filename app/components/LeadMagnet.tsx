import React from "react";
import Section from "./Section";
import Button from "./Button";
import { Download } from "lucide-react";

const LeadMagnet: React.FC = () => {
    return (
        <div className="bg-gray-100 border-t border-gray-200">
            <Section bg="gray" className="py-12">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-block px-3 py-1 bg-navy-100 text-navy-800 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                            Free Guide
                        </div>
                        <h3 className="text-2xl font-bold text-navy-900 mb-2">Not Ready to Enroll? Start Here.</h3>
                        <p className="text-gray-600 mb-4">
                            Get our free <strong>Evidence System Guide</strong> and learn the 5-Tier Documentation Hierarchy that wins 90% of cases.
                        </p>
                        <p className="text-xs text-gray-400">
                            We respect your privacy. Unsubscribe anytime.
                        </p>
                    </div>

                    <div className="w-full md:w-auto flex-shrink-0">
                        <form className="flex flex-col gap-3 w-full md:w-80">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-navy-900 focus:border-transparent outline-none transition-all"
                                required
                            />
                            <Button variant="secondary" size="md" className="w-full justify-center">
                                <Download className="w-4 h-4 mr-2" />
                                Download Free Guide
                            </Button>
                        </form>
                    </div>
                </div>
            </Section>
        </div>
    );
};

export default LeadMagnet;
