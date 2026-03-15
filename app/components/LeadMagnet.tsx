import React from "react";
import Section from "./Section";
import Script from "next/script";

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
                            Get our free <strong>Evidence Hierarchy Guide</strong> and learn the 5-Tier Documentation Framework that wins 90% of cases.
                        </p>
                        <p className="text-xs text-gray-400">
                            We respect your privacy. Unsubscribe anytime.
                        </p>
                    </div>
                    <div className="w-full md:w-auto flex-shrink-0 md:w-80">

                            <Script
                            async
                            data-uid="90ae105bce"
                            src="https://forcemultiplier.kit.com/90ae105bce/index.js"
                            strategy="lazyOnload"
                        />

                    </div>
                </div>
            </Section>
        </div>
    );
};

export default LeadMagnet;
