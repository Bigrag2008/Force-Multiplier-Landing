import React from "react";
import Section from "@/components/ui/Section";
import { BookOpen, Folder, Scale, Clock, DollarSign, AlertTriangle, Flag } from "lucide-react";

const Modules: React.FC = () => {
    const modules = [
        {
            icon: BookOpen,
            title: "Module 1: Foundations",
            items: [
                "What is Individual Democracy and why it works",
                "Power dynamics and settlement math",
                "The 5-tier evidence system (90% vs 10% win rates)",
                "Ethical boundaries that protect you"
            ]
        },
        {
            icon: Folder,
            title: "Module 2: Building Your Foundation",
            items: [
                "Evidence collection system (3-folder structure)",
                "Witness management",
                "Email tactics that create paper trails",
                "Recording conversations (where legal)"
            ]
        },
        {
            icon: Scale,
            title: "Module 3: Regulatory Leverage",
            items: [
                "EEOC complaints: Filing basics + strategic timing",
                "DOL wage & hour violations",
                "OSHA safety retaliation",
                "Multi-agency pressure tactics"
            ]
        },
        {
            icon: Clock,
            title: "Module 4: Timeline Pressure",
            items: [
                "Earnings call leverage (file 30 days before)",
                "Leadership transitions (new CEO = clean slate)",
                "Fiscal year-end exploitation",
                "Creating urgency without threats"
            ]
        },
        {
            icon: DollarSign,
            title: "Module 5: Settlement Negotiation",
            items: [
                "BATNA calculation (your walkaway point)",
                "Anchoring & counter-offers",
                "Closing the deal",
                "Settlement agreement terms"
            ]
        },
        {
            icon: AlertTriangle,
            title: "Module 6: Special Situations",
            items: [
                "Performance Improvement Plans (PIPs)",
                "Layoffs and 'voluntary' resignations",
                "Constructive discharge",
                "Internal investigations"
            ]
        },
        {
            icon: Flag,
            title: "Module 7: Post-Settlement",
            items: [
                "Tax strategy (minimize taxes on settlement)",
                "Skills arbitrage (use settlement $ to upgrade career)",
                "Career narrative (explain gap to future employers)",
                "Moving forward with confidence"
            ]
        }
    ];

    return (
        <Section bg="navy" id="modules">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
                    The Complete System in 7 Modules
                </h2>
                <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                    Every step of the process, from gathering evidence to depositing your check, broken down into actionable lessons.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {modules.map((module, index) => (
                    <div key={index} className="bg-navy-900 border border-navy-700 rounded-xl p-6 hover:border-gold-500/50 transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-navy-800 rounded-lg flex items-center justify-center text-gold-500">
                                <module.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white">{module.title}</h3>
                        </div>
                        <ul className="space-y-3">
                            {module.items.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-gold-500 rounded-full flex-shrink-0"></span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </Section>
    );
};

export default Modules;
