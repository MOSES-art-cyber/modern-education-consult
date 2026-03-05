import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { SiWhatsapp } from "react-icons/si";
import { useSubmitContact } from "../hooks/useQueries";

export default function ContactPage() {
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    countryOfInterest: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const submitContact = useSubmitContact();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitContact.mutateAsync(form);
      setSubmitted(true);
    } catch (_err) {
      // error handled by mutation state
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <main className="pt-16 lg:pt-20">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="brand-dark-bg py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background:
              "radial-gradient(ellipse at 60% 50%, oklch(0.58 0.2 258), transparent 60%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-bold tracking-widest uppercase text-white/50 mb-3 block">
              Reach Out
            </span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-4">
              Get in Touch
            </h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
              We are ready to assist you. Reach out to our team for professional
              guidance and consultation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Contact Section ──────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2"
            >
              <Card className="brand-dark-bg border-0 shadow-card-hover h-full">
                <CardContent className="p-8">
                  <h2 className="font-display font-bold text-2xl text-white mb-2">
                    Contact Information
                  </h2>
                  <p className="text-white/60 text-sm mb-8">
                    Reach out to us through any of the channels below. Our team
                    is ready to help.
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Phone size={18} className="text-white/70" />
                      </div>
                      <div>
                        <p className="text-white/50 text-xs uppercase tracking-widest mb-1">
                          Phone
                        </p>
                        <a
                          href="tel:+250798979720"
                          className="text-white font-medium hover:text-primary transition-colors"
                        >
                          +250 798979720
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#25D366" + "33" }}
                      >
                        <SiWhatsapp size={18} color="#25D366" />
                      </div>
                      <div>
                        <p className="text-white/50 text-xs uppercase tracking-widest mb-1">
                          WhatsApp
                        </p>
                        <a
                          href="https://wa.me/250795780073"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium transition-colors"
                          style={{ color: "#25D366" }}
                        >
                          +250 795780073
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Mail size={18} className="text-white/70" />
                      </div>
                      <div>
                        <p className="text-white/50 text-xs uppercase tracking-widest mb-1">
                          Email
                        </p>
                        <a
                          href="mailto:moderneducationconsult2025@gmail.com"
                          className="text-white font-medium hover:text-primary transition-colors break-all text-sm"
                        >
                          moderneducationconsult2025@gmail.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <MapPin size={18} className="text-white/70" />
                      </div>
                      <div>
                        <p className="text-white/50 text-xs uppercase tracking-widest mb-1">
                          Office Location
                        </p>
                        <p className="text-white font-medium">
                          Kigali, Musanze
                        </p>
                        <p className="text-white/70 text-sm">RWANDA</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 pt-6 border-t border-white/10">
                    <p className="text-white/60 text-xs mb-4">
                      Connect with us on WhatsApp for instant support
                    </p>
                    <a
                      href="https://wa.me/250795780073"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full justify-center py-3 px-4 rounded-xl font-bold text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: "#25D366" }}
                    >
                      <SiWhatsapp size={18} />
                      Chat on WhatsApp
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-3"
            >
              <Card className="border-0 shadow-card">
                <CardContent className="p-8">
                  <h2 className="font-display font-bold text-2xl text-brand-dark mb-2">
                    Send Your Application
                  </h2>
                  <p className="text-foreground/60 text-sm mb-8">
                    Fill in the form below and our team will get back to you
                    within 24 hours.
                  </p>

                  {submitted ? (
                    <motion.div
                      data-ocid="contact.success_state"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 size={36} className="text-green-600" />
                      </div>
                      <h3 className="font-display font-bold text-2xl text-brand-dark mb-2">
                        Application Sent!
                      </h3>
                      <p className="text-foreground/60 max-w-sm mx-auto">
                        Thank you for reaching out. Our team will contact you
                        within 24 hours to discuss your requirements.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="fullName"
                            className="text-sm font-medium text-foreground/80"
                          >
                            Full Name{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="fullName"
                            name="fullName"
                            data-ocid="contact.input.1"
                            placeholder="Your full name"
                            value={form.fullName}
                            onChange={handleChange}
                            required
                            className="border-border focus:border-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="phoneNumber"
                            className="text-sm font-medium text-foreground/80"
                          >
                            Phone Number{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            data-ocid="contact.input.2"
                            placeholder="+250 7XX XXX XXX"
                            value={form.phoneNumber}
                            onChange={handleChange}
                            required
                            className="border-border focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="email"
                            className="text-sm font-medium text-foreground/80"
                          >
                            Email Address{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            data-ocid="contact.input.3"
                            placeholder="your@email.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="border-border focus:border-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="countryOfInterest"
                            className="text-sm font-medium text-foreground/80"
                          >
                            Country of Interest
                          </Label>
                          <Input
                            id="countryOfInterest"
                            name="countryOfInterest"
                            data-ocid="contact.input.4"
                            placeholder="e.g. Canada, UK, UAE"
                            value={form.countryOfInterest}
                            onChange={handleChange}
                            className="border-border focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="message"
                          className="text-sm font-medium text-foreground/80"
                        >
                          Message <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          data-ocid="contact.textarea"
                          placeholder="Tell us about your goals, background, and how we can help you..."
                          value={form.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          className="border-border focus:border-primary resize-none"
                        />
                      </div>

                      {submitContact.isError && (
                        <div
                          data-ocid="contact.error_state"
                          className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                        >
                          <AlertCircle size={16} />
                          <span>
                            Something went wrong. Please try again or contact us
                            directly on WhatsApp.
                          </span>
                        </div>
                      )}

                      <Button
                        type="submit"
                        data-ocid="contact.submit_button"
                        disabled={submitContact.isPending}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 text-base shadow-blue hover:-translate-y-0.5 transition-all"
                        size="lg"
                      >
                        {submitContact.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending Application...
                          </>
                        ) : (
                          "Send Application"
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
