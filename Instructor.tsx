export default function Instructor() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-[300px_1fr] gap-12 items-start">
          
          {/* Creator Photo */}
          <div className="text-center">
            <img
              src="/creator-photo.jpg"
              alt="LaMont, Founder of Force Multiplier HQ"
              className="w-64 h-64 rounded-full object-cover mx-auto shadow-xl border-4 border-indigo-600"
            />
          </div>
          
          {/* Creator Bio */}
          <div>
            <h2 className="text-4xl font-bold mb-4 text-gray-900">About LaMont</h2>
            <p className="text-lg text-indigo-600 mb-6 font-semibold">
              Founder & CEO, Force Multiplier HQ
            </p>
            
            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
              <p>
                Former college football athlete. B.S. Information Systems. Worked everywhere 
                from warehouses to Amazon Web Services—DHL, 7-Eleven Corporate, AWS. 
                Saw the same pattern everywhere: employees facing discrimination with no 
                affordable path to fight back.
              </p>
              
              <p>
                The barrier was always the same. $10,000 for a lawyer most people don't have. 
                So they quit, get fired, or accept injustice. That pattern needed to break.
              </p>
              
              <p>
                Spent three years systematically analyzing 500+ EEOC settlement outcomes. 
                Found what wins, what loses, what gets $70k vs $20k. Built frameworks—The 
                Evidence Hierarchy, Settlement Math, Regulatory Stacking—that turn legal 
                knowledge into repeatable systems.
              </p>
              
              <p>
                Force Multiplier students have recovered millions in settlements without 
                paying attorney fees. Individual Democracy isn't philosophy—it's proven methodology.
              </p>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-orange-500 rounded-lg">
                <p className="text-xl italic text-gray-800">
                  "From Dayton, Ohio—the birthplace of innovation. The Wright Brothers didn't 
                  just dream about flight. They systematically experimented until they cracked 
                  the code. That's what Force Multiplier does for workplace justice."
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
```
```
SAVE THIS:
□ Scroll to bottom
□ Commit message: "Update instructor bio with LaMont's story"
□ Click "Commit changes"
```

---

# 🦸 STEP 3: UPDATE HERO.TSX (ADD YOUR LOGO)
```
FIND THE FILE:
□ Click "Hero.tsx"
□ Click pencil to edit

LOOK FOR THE HERO SECTION
You'll see something like:
<section className="...">
  <h1>...</h1>
  <p>...</p>
  <button>...</button>
</section>

ADD YOUR LOGO IMAGE AT THE TOP:
