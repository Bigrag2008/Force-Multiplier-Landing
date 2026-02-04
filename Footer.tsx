import React from "react";
import { Twitter, Linkedin, Youtube } from "lucide-react";

const Footer: React.FC = () => {
    return (
        <footer className="bg-navy-900 text-white py-12 border-t border-navy-800">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <h3 className="text-xl font-heading font-bold text-white mb-2">Force Multiplier</h3>
                        <p className="text-gray-400 text-sm">© 2026 Force Multiplier. All rights reserved.</p>
                    </div>

                    <div className="flex gap-6 text-sm text-gray-400">
                        <a href="#" className="hover:text-gold-500 transition-colors">About</a>
                        <a href="#" className="hover:text-gold-500 transition-colors">Contact</a>
                        <a href="#" className="hover:text-gold-500 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-gold-500 transition-colors">Terms of Service</a>
                    </div>

                    <div className="flex gap-4">
                        <a href="#" className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center text-gray-400 hover:bg-gold-500 hover:text-navy-900 transition-all">
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center text-gray-400 hover:bg-gold-500 hover:text-navy-900 transition-all">
                            <Linkedin className="w-5 h-5" />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center text-gray-400 hover:bg-gold-500 hover:text-navy-900 transition-all">
                            <Youtube className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
