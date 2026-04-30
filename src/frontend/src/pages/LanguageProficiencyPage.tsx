import AdminDropZone from "@/components/AdminDropZone";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Languages } from "lucide-react";
import { motion } from "motion/react";
import PageSectionRenderer from "../components/admin/PageSectionRenderer";
import { useGetAllWebsitePages } from "../hooks/useQueries";

export default function LanguageProficiencyPage() {
  const { data: pages } = useGetAllWebsitePages();
  const pageData = pages?.find((p) => p.slug === "language-proficiency");
  const dynamicSections =
    pageData?.sections && pageData.sections.length > 0
      ? [...pageData.sections].sort((a, b) => Number(a.order) - Number(b.order))
      : null;

  if (dynamicSections) {
    return (
      <main className="pt-16 lg:pt-20">
        {dynamicSections.map((section) => (
          <PageSectionRenderer
            key={section.id.toString()}
            section={section}
            isEditing={false}
            onEditField={() => {}}
            onImagePick={() => {}}
          />
        ))}
      </main>
    );
  }

  return (
    <main className="pt-16 lg:pt-20">
      {/* Hero */}
      <section className="brand-dark-bg py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background:
              "radial-gradient(ellipse at 40% 60%, oklch(0.58 0.2 258), transparent 60%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/services"
              data-ocid="language.link"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft size={15} /> Back to Services
            </Link>
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
              <Languages size={32} className="text-white" />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase text-white/50 mb-3 block">
              Additional Programs
            </span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-4">
              Language Proficiency Programs
            </h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
              Prepare for internationally recognized language tests in English
              and French to strengthen your applications.
            </p>
          </motion.div>
        </div>
      </section>

      {/* English & French sections */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* ── English Section ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border-2 border-border bg-accent/30 shadow-card overflow-hidden"
          >
            <div className="brand-dark-bg px-8 py-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold text-white shrink-0">
                🇬🇧
              </div>
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-white/50 block">
                  Language Test
                </span>
                <h2 className="font-display font-bold text-2xl text-white">
                  English Proficiency
                </h2>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <p className="text-foreground/70 text-sm leading-relaxed">
                Demonstrate your English language proficiency with
                internationally recognized tests. We recommend the Duolingo
                English Test — accepted by thousands of universities worldwide,
                available anytime online.
              </p>

              <div>
                <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-3">
                  Official Test Portal
                </p>
                <a
                  href="https://englishtest.duolingo.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="language.english.link"
                  className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-blue group"
                >
                  <span className="text-lg">🦉</span>
                  Duolingo English Test
                  <ExternalLink
                    size={16}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </a>
              </div>

              {/* Admin-only drop zone for English */}
              <div className="pt-2">
                <AdminDropZone
                  label="English Test Documents & Links"
                  ocidPrefix="language.english"
                />
              </div>
            </div>
          </motion.div>

          {/* ── French Section ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-3xl border-2 border-border bg-accent/30 shadow-card overflow-hidden"
          >
            <div className="brand-dark-bg px-8 py-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold text-white shrink-0">
                🇫🇷
              </div>
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-white/50 block">
                  Language Test
                </span>
                <h2 className="font-display font-bold text-2xl text-white">
                  French Proficiency
                </h2>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <p className="text-foreground/70 text-sm leading-relaxed">
                Prove your French language skills for Canadian immigration and
                academic applications. Two officially recognized exams are
                available for French proficiency in Canada.
              </p>

              <div>
                <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-3">
                  Official Test Portals
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://www.lefrancaisdesaffaires.fr/tests-diplomes/test-evaluation-francais-tef/tef-canada/"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-ocid="language.french.tef.link"
                    className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-blue group"
                  >
                    <span className="font-bold text-white/80 text-sm">TEF</span>
                    TEF Canada
                    <ExternalLink
                      size={16}
                      className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                    />
                  </a>
                  <a
                    href="https://www.france-education-international.fr/test/tcf-canada"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-ocid="language.french.tcf.link"
                    className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-colors group"
                  >
                    <span className="font-bold text-sm">TCF</span>
                    TCF Canada
                    <ExternalLink
                      size={16}
                      className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                    />
                  </a>
                </div>
              </div>

              {/* Admin-only drop zone for French */}
              <div className="pt-2">
                <AdminDropZone
                  label="French Test Documents & Links"
                  ocidPrefix="language.french"
                />
              </div>
            </div>
          </motion.div>

          <div className="text-center pt-4">
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-white font-bold px-8 shadow-blue"
            >
              <Link to="/contact" data-ocid="language.primary_button">
                Get Preparation Guidance — Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
