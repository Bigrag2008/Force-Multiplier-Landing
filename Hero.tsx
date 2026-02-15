import React from "react";
import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import { CheckCircle, Clock, FileText } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white py-20 overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        
        {/* ADD THIS - YOUR LOGO */}
        <div className="text-center mb-8">
          <img
            src="/hero-image.jpg"
            alt="Force Multiplier Logo"
            className="mx-auto w-48 h-48 object-contain drop-shadow-2xl"
          />
        </div>
        
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            File Your EEOC Charge & Win Your Settlement
          </h1>
          
          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            Without Paying a Lawyer $10,000
          </h2>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-95">
            The proven system for navigating workplace discrimination, 
            building ironclad evidence, and negotiating $40k-$70k settlements 
            in 90-180 days.
          </p>
          
          {/* CTA BUTTON */}
          
            href="https://forcemultiplierhq.teachable.com/p/force-multiplier"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-xl font-bold py-4 px-10 rounded-lg shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            ENROLL NOW - $497
          </a>
          
          <p className="mt-6 text-lg opacity-90">
            ✓ 28 Video Lessons (11+ Hours) • ✓ 140-Page Workbook • ✓ Lifetime Access
          </p>
        </div>
      </div>
    </section>
  );
}
```
```
    );
};

export default Hero;

