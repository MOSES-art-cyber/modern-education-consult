import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const countries = [
  {
    flag: "🇺🇸",
    name: "United States",
    tagline: "Higher education and scholarship programs",
    desc: "The US hosts some of the world's top-ranked universities and offers diverse scholarship opportunities. From Ivy League institutions to state universities, we help you find the perfect fit.",
    highlights: [
      "World-class research universities",
      "Diverse scholarship programs",
      "STEM opportunities",
      "Post-study work options (OPT/CPT)",
    ],
  },
  {
    flag: "🇨🇦",
    name: "Canada",
    tagline: "Study and work opportunities",
    desc: "Canada is known for its welcoming immigration policies, high-quality education, and excellent post-graduation work permits — making it a top choice for international students.",
    highlights: [
      "Post-Graduate Work Permit (PGWP)",
      "Pathway to permanent residency",
      "Affordable tuition fees",
      "Bilingual opportunities",
    ],
  },
  {
    flag: "🇬🇧",
    name: "United Kingdom",
    tagline: "Academic and professional pathways",
    desc: "Home to world-renowned institutions like Oxford and Cambridge, the UK offers prestigious degrees and strong employment networks across multiple sectors.",
    highlights: [
      "Prestigious Russell Group universities",
      "Graduate Route visa (2 years work)",
      "Rich cultural experience",
      "Strong professional networks",
    ],
  },
  {
    flag: "🇦🇪",
    name: "United Arab Emirates",
    tagline: "Employment and education opportunities",
    desc: "The UAE offers excellent employment opportunities especially in finance, technology, hospitality, and construction sectors, with competitive salaries and a tax-free income.",
    highlights: [
      "Tax-free income",
      "Growing tech sector",
      "International business hub",
      "Multicultural work environment",
    ],
  },
  {
    flag: "🇪🇺",
    name: "Europe",
    tagline: "Education and selected employment programs",
    desc: "Europe offers diverse study and work opportunities across Germany, France, Netherlands, and other nations — many with tuition-free or low-cost education for international students.",
    highlights: [
      "Free/affordable tuition (Germany)",
      "Schengen work opportunities",
      "Erasmus+ programs",
      "Cultural diversity",
    ],
  },
  {
    flag: "🇨🇳",
    name: "China",
    tagline: "Academic exchange and scholarship programs",
    desc: "China offers generous government scholarships through the CSC scholarship program and is home to rapidly rising global universities with strong STEM and business programs.",
    highlights: [
      "Chinese Government Scholarships (CSC)",
      "Growing global rankings",
      "Mandarin language programs",
      "Business and technology focus",
    ],
  },
  {
    flag: "🇦🇺",
    name: "Australia",
    tagline: "Education and professional opportunities",
    desc: "Australia's world-class universities, stunning environment, and post-study work rights make it an attractive destination for students seeking quality education and career opportunities.",
    highlights: [
      "Post-Study Work Visa (2-4 years)",
      "Top QS-ranked universities",
      "Skilled migration pathways",
      "High quality of life",
    ],
  },
];

export default function CountriesPage() {
  return (
    <main className="pt-16 lg:pt-20">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="brand-dark-bg py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background:
              "radial-gradient(ellipse at 70% 50%, oklch(0.58 0.2 258), transparent 60%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-bold tracking-widest uppercase text-white/50 mb-3 block">
              Global Reach
            </span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-4">
              Countries We Serve
            </h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
              We provide professional guidance for opportunities in 7 countries
              across North America, Europe, Asia, and the Pacific.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Countries Grid ───────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {countries.map((country, i) => (
              <motion.div
                key={country.name}
                data-ocid={`countries.item.${i + 1}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              >
                <Card className="h-full border-0 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group overflow-hidden">
                  <CardContent className="p-0">
                    {/* Card header */}
                    <div className="brand-dark-bg p-6 relative overflow-hidden">
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                        style={{
                          background:
                            "radial-gradient(ellipse at 50% 50%, oklch(0.58 0.2 258), transparent)",
                        }}
                      />
                      <div className="relative flex items-center gap-4">
                        <span className="text-5xl leading-none">
                          {country.flag}
                        </span>
                        <div>
                          <h3 className="font-display font-bold text-xl text-white">
                            {country.name}
                          </h3>
                          <p className="text-white/60 text-xs mt-1">
                            {country.tagline}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Card body */}
                    <div className="p-6">
                      <p className="text-foreground/70 text-sm leading-relaxed mb-4">
                        {country.desc}
                      </p>
                      <ul className="space-y-1.5 mb-5">
                        {country.highlights.map((h) => (
                          <li
                            key={h}
                            className="flex items-center gap-2 text-xs text-foreground/70"
                          >
                            <ArrowRight
                              size={12}
                              className="text-brand-blue flex-shrink-0"
                            />
                            {h}
                          </li>
                        ))}
                      </ul>
                      <Button
                        asChild
                        size="sm"
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold text-xs"
                      >
                        <Link to="/contact">Apply for {country.name}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="py-20 brand-dark-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-bold text-3xl text-white mb-4">
              Find Your Destination
            </h2>
            <p className="text-white/70 mb-8">
              Not sure which country is right for you? Our experts will help you
              choose the best destination for your goals.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-bold px-10 shadow-blue"
            >
              <Link to="/contact">Get Expert Advice</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
