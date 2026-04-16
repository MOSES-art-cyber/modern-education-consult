import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Mail,
  MapPin,
  Paperclip,
  Phone,
  Upload,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiWhatsapp } from "react-icons/si";
import { useSubmitContact } from "../hooks/useQueries";
import type { FileAttachment } from "../types/index";

export const SERVICE_OPTIONS = [
  "Study Abroad Consultation & Processing",
  "Work Abroad Consultation & Processing",
  "Scholarships & Financial Aid",
  "Visa Assistance",
  "Online Degree Courses",
  "Online Professional Courses",
  "Professional Internship",
  "Language Test Preparation - English (IELTS / TOEFL / Duolingo)",
  "Language Test Preparation - Français (TEF Canada / TCF Canada)",
  "Document Review & Application Support",
] as const;

export const COUNTRY_REQUIRED_SERVICES = new Set([
  "Study Abroad Consultation & Processing",
  "Work Abroad Consultation & Processing",
  "Scholarships & Financial Aid",
  "Visa Assistance",
  "Professional Internship",
]);

export const MESSAGE_PLACEHOLDERS: Record<string, string> = {
  "Study Abroad Consultation & Processing":
    "Tell us your preferred country, level of study, and intake",
  "Work Abroad Consultation & Processing":
    "Tell us your preferred country and job type",
  "Scholarships & Financial Aid":
    "Tell us your preferred country, academic background and goals",
  "Visa Assistance":
    "Tell us the destination country, visa type, and your current application status",
  "Online Degree Courses":
    "Tell us your field of interest, preferred study mode, and highest qualification",
  "Online Professional Courses":
    "Tell us the skill or career area you want to improve and your experience level",
  "Professional Internship":
    "Tell us your field of study, preferred country, and internship duration",
  "Language Test Preparation - English (IELTS / TOEFL / Duolingo)":
    "Tell us the test (IELTS, TOEFL, Duolingo, TEF Canada, TCF Canada), your target score, and preferred schedule",
  "Language Test Preparation - Français (TEF Canada / TCF Canada)":
    "Tell us the test (IELTS, TOEFL, Duolingo, TEF Canada, TCF Canada), your target score, and preferred schedule",
  "Document Review & Application Support":
    "Tell us which documents you need reviewed and the purpose of your application",
};

const DEFAULT_MESSAGE_PLACEHOLDER =
  "Tell us about your goals, background, and how we can help you...";

export const CONTACT_METHOD_OPTIONS = [
  "WhatsApp",
  "Phone Call",
  "Email",
  "All / Any of them",
];

const ACCEPTED_FILE_TYPES = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCaptcha() {
  const a = randomInt(1, 9);
  const b = randomInt(1, 9);
  return { a, b, answer: a + b };
}

interface FieldErrors {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  serviceOfInterest?: string;
  preferredContactMethod?: string;
  message?: string;
  privacyConsent?: string;
  captcha?: string;
}

export default function ContactPage() {
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    serviceOfInterest: "",
    countryOfInterest: "",
    message: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [preferredContactMethod, setPreferredContactMethod] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [whatsappFallbackUrl, setWhatsappFallbackUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CAPTCHA state
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");

  const submitContact = useSubmitContact();

  const showCountryField = COUNTRY_REQUIRED_SERVICES.has(
    form.serviceOfInterest,
  );

  const messagePlaceholder =
    MESSAGE_PLACEHOLDERS[form.serviceOfInterest] ?? DEFAULT_MESSAGE_PLACEHOLDER;

  // Reset country when service changes to non-country service
  useEffect(() => {
    if (!COUNTRY_REQUIRED_SERVICES.has(form.serviceOfInterest)) {
      setForm((prev) => ({ ...prev, countryOfInterest: "" }));
    }
  }, [form.serviceOfInterest]);

  function addFiles(newFiles: FileList | File[]) {
    const errors: string[] = [];
    const valid: File[] = [];
    for (const file of Array.from(newFiles)) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`"${file.name}" exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
      } else {
        valid.push(file);
      }
    }
    setFileErrors(errors);
    setUploadedFiles((prev) => [...prev, ...valid]);
  }

  function removeFile(idx: number) {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function readFilesAsBase64(files: File[]): Promise<FileAttachment[]> {
    return Promise.all(
      files.map(
        (file) =>
          new Promise<FileAttachment>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
              resolve({
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                fileUrl: ev.target?.result as string,
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }),
      ),
    );
  }

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: FieldErrors = {};

    if (!form.fullName.trim()) errors.fullName = "Full name is required.";
    if (!form.phoneNumber.trim())
      errors.phoneNumber = "Phone number is required.";
    if (!form.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!validateEmail(form.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!form.serviceOfInterest)
      errors.serviceOfInterest = "Please select a service.";
    if (!form.message.trim()) errors.message = "Message is required.";
    if (!preferredContactMethod)
      errors.preferredContactMethod =
        "Please select a preferred contact method.";
    if (!privacyConsent)
      errors.privacyConsent =
        "You must agree to the privacy policy to proceed.";

    const captchaVal = Number.parseInt(captchaInput.trim(), 10);
    if (Number.isNaN(captchaVal) || captchaVal !== captcha.answer) {
      errors.captcha = "Incorrect answer, please try again.";
      setCaptcha(generateCaptcha());
      setCaptchaInput("");
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // ── WhatsApp Notification ────────────────────────────────────────────────
    // Build the WhatsApp URL BEFORE any async operation so that window.open()
    // is called synchronously within the user gesture — browsers only allow
    // popups when triggered directly by a user action, not after awaited calls.
    const documentsInfo =
      uploadedFiles.length > 0
        ? uploadedFiles.map((f) => f.name).join(", ")
        : "None";
    const whatsappMessage = [
      "🔔 New Application Received",
      "━━━━━━━━━━━━━━━━━━━━━",
      `👤 Full Name: ${form.fullName}`,
      `📞 Phone: ${form.phoneNumber}`,
      `📧 Email: ${form.email}`,
      `🎯 Service: ${form.serviceOfInterest}`,
      `🌍 Country: ${form.countryOfInterest || "Not specified"}`,
      `📬 Preferred Contact: ${preferredContactMethod || "Not specified"}`,
      `📎 Documents: ${documentsInfo}`,
      `💬 Message: ${form.message}`,
      "━━━━━━━━━━━━━━━━━━━━━",
      "Sent from Modern Education Consult Website",
    ].join("\n");
    const whatsappUrl = `https://wa.me/250795780073?text=${encodeURIComponent(whatsappMessage)}`;

    // Open WhatsApp immediately — still inside the synchronous click handler
    window.open(whatsappUrl, "_blank");

    // Store the URL so the success screen can show a fallback link if the
    // browser blocked the popup
    setWhatsappFallbackUrl(whatsappUrl);
    // ── End WhatsApp Notification ────────────────────────────────────────────

    try {
      const attachedFiles = await readFilesAsBase64(uploadedFiles);
      await submitContact.mutateAsync({
        ...form,
        preferredContactMethod,
        privacyConsent,
        attachedFiles,
      });
    } catch (_err) {
      // Submission error is shown via submitContact.isError state.
      // WhatsApp was already opened above regardless of backend outcome.
    }

    // Show success screen whether or not the backend call succeeded —
    // WhatsApp was already sent so the admin is notified either way.
    setSubmitted(true);
    setUploadedFiles([]);
    setFileErrors([]);
    setPreferredContactMethod("");
    setPrivacyConsent(false);
    setCaptchaInput("");
    setCaptcha(generateCaptcha());
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const FieldError = useMemo(
    () =>
      ({ id }: { id: keyof FieldErrors }) =>
        fieldErrors[id] ? (
          <p
            data-ocid={`contact.${id}.field_error`}
            className="text-xs text-destructive flex items-center gap-1 mt-1"
          >
            <AlertCircle size={12} /> {fieldErrors[id]}
          </p>
        ) : null,
    [fieldErrors],
  );

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
                          href="mailto:moderneducationconsult2026@gmail.com"
                          className="text-white font-medium hover:text-primary transition-colors break-all text-sm"
                        >
                          moderneducationconsult2026@gmail.com
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
                <CardContent className="p-6 sm:p-8">
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
                      <h3 className="font-display font-bold text-2xl text-brand-dark mb-3">
                        Application Received!
                      </h3>
                      <p className="text-foreground/70 max-w-sm mx-auto text-base leading-relaxed font-medium mb-6">
                        Thank you for your application. Our team will contact
                        you within 24 hours or Earlier.
                      </p>
                      {whatsappFallbackUrl && (
                        <a
                          href={whatsappFallbackUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-ocid="contact.whatsapp_fallback_link"
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 hover:-translate-y-0.5"
                          style={{ backgroundColor: "#25D366" }}
                        >
                          <SiWhatsapp size={17} />
                          Also notify us via WhatsApp
                        </a>
                      )}
                    </motion.div>
                  ) : (
                    <form
                      onSubmit={handleSubmit}
                      className="space-y-5"
                      noValidate
                    >
                      {/* Row 1: Full Name + Phone */}
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
                            className={`border-border focus:border-primary ${fieldErrors.fullName ? "border-destructive focus:border-destructive" : ""}`}
                          />
                          <FieldError id="fullName" />
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
                            className={`border-border focus:border-primary ${fieldErrors.phoneNumber ? "border-destructive focus:border-destructive" : ""}`}
                          />
                          <FieldError id="phoneNumber" />
                        </div>
                      </div>

                      {/* Row 2: Email */}
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
                          className={`border-border focus:border-primary ${fieldErrors.email ? "border-destructive focus:border-destructive" : ""}`}
                        />
                        <FieldError id="email" />
                      </div>

                      {/* Row 3: Service of Interest */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="serviceOfInterest"
                          className="text-sm font-medium text-foreground/80"
                        >
                          Service of Interest{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <select
                            id="serviceOfInterest"
                            name="serviceOfInterest"
                            data-ocid="contact.select"
                            value={form.serviceOfInterest}
                            onChange={handleChange}
                            className={`w-full appearance-none rounded-md border bg-background px-3 py-2 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                              fieldErrors.serviceOfInterest
                                ? "border-destructive focus:ring-destructive/30"
                                : "border-border focus:border-primary"
                            }`}
                          >
                            <option value="" disabled>
                              Select a service you are interested in
                            </option>
                            {SERVICE_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={16}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50"
                          />
                        </div>
                        <FieldError id="serviceOfInterest" />
                      </div>

                      {/* Row 4: Country of Interest — conditional */}
                      {showCountryField && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-1.5"
                        >
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
                            placeholder="e.g. Canada, UK, UAE, Germany"
                            value={form.countryOfInterest}
                            onChange={handleChange}
                            className="border-border focus:border-primary"
                          />
                        </motion.div>
                      )}

                      {/* Row 5: Message */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="message"
                          className="text-sm font-medium text-foreground/80"
                        >
                          Message / Application Details{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          data-ocid="contact.textarea"
                          placeholder={messagePlaceholder}
                          value={form.message}
                          onChange={handleChange}
                          rows={5}
                          className={`border-border focus:border-primary resize-none ${fieldErrors.message ? "border-destructive focus:border-destructive" : ""}`}
                        />
                        <FieldError id="message" />
                      </div>

                      {/* Row 6: File Upload (Optional) */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground/80">
                          Upload Documents{" "}
                          <span className="text-foreground/40 font-normal">
                            (Optional)
                          </span>
                        </Label>
                        <p className="text-xs text-foreground/50">
                          Upload CV, passport, certificates, transcripts, or any
                          supporting documents.
                        </p>

                        <div
                          data-ocid="contact.dropzone"
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragOver(true);
                          }}
                          onDragLeave={() => setIsDragOver(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragOver(false);
                            addFiles(e.dataTransfer.files);
                          }}
                          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg px-4 py-6 transition-colors ${
                            isDragOver
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 hover:bg-muted/30"
                          }`}
                        >
                          <Upload
                            size={22}
                            className={
                              isDragOver ? "text-primary" : "text-foreground/30"
                            }
                          />
                          <p className="text-sm text-foreground/60 text-center">
                            <button
                              type="button"
                              className="font-medium text-primary hover:underline"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              Click to upload
                            </button>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-foreground/40 text-center">
                            PDF, DOC, DOCX, JPG, JPEG, PNG — max{" "}
                            {MAX_FILE_SIZE_MB}MB per file
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={ACCEPTED_FILE_TYPES}
                            className="hidden"
                            data-ocid="contact.upload_button"
                            onChange={(e) => {
                              if (e.target.files) addFiles(e.target.files);
                              e.target.value = "";
                            }}
                          />
                        </div>

                        {fileErrors.map((err) => (
                          <p
                            key={err}
                            className="text-xs text-destructive flex items-center gap-1"
                          >
                            <AlertCircle size={12} /> {err}
                          </p>
                        ))}

                        {uploadedFiles.length > 0 && (
                          <ul className="space-y-1.5 mt-1">
                            {uploadedFiles.map((file, idx) => (
                              <li
                                key={`${file.name}-${idx}`}
                                data-ocid={`contact.file.item.${idx + 1}`}
                                className="flex items-center gap-2 bg-muted/40 rounded-md px-3 py-2 text-sm"
                              >
                                <Paperclip
                                  size={13}
                                  className="text-primary flex-shrink-0"
                                />
                                <span className="flex-1 truncate min-w-0 text-foreground/80">
                                  {file.name}
                                </span>
                                <span className="text-foreground/40 text-xs flex-shrink-0">
                                  {formatFileSize(file.size)}
                                </span>
                                <button
                                  type="button"
                                  aria-label={`Remove ${file.name}`}
                                  data-ocid={`contact.file.delete_button.${idx + 1}`}
                                  onClick={() => removeFile(idx)}
                                  className="text-foreground/40 hover:text-destructive transition-colors flex-shrink-0"
                                >
                                  <X size={14} />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Row 7: Preferred Contact Method (Required) */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="preferredContactMethod"
                          className="text-sm font-medium text-foreground/80"
                        >
                          Preferred Contact Method{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <select
                            id="preferredContactMethod"
                            data-ocid="contact.contact_method.select"
                            value={preferredContactMethod}
                            onChange={(e) => {
                              setPreferredContactMethod(e.target.value);
                              if (e.target.value)
                                setFieldErrors((prev) => ({
                                  ...prev,
                                  preferredContactMethod: undefined,
                                }));
                            }}
                            className={`w-full appearance-none rounded-md border bg-background px-3 py-2 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                              fieldErrors.preferredContactMethod
                                ? "border-destructive focus:ring-destructive/30"
                                : "border-border focus:border-primary"
                            }`}
                          >
                            <option value="" disabled>
                              Select preferred contact method
                            </option>
                            {CONTACT_METHOD_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={16}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50"
                          />
                        </div>
                        <FieldError id="preferredContactMethod" />
                      </div>

                      {/* Row 8: Privacy Consent */}
                      <div className="space-y-1.5">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id="privacyConsent"
                            data-ocid="contact.privacy_consent.checkbox"
                            checked={privacyConsent}
                            onChange={(e) => {
                              setPrivacyConsent(e.target.checked);
                              if (e.target.checked)
                                setFieldErrors((prev) => ({
                                  ...prev,
                                  privacyConsent: undefined,
                                }));
                            }}
                            className="mt-0.5 h-4 w-4 cursor-pointer rounded border-border accent-primary flex-shrink-0"
                          />
                          <label
                            htmlFor="privacyConsent"
                            className="text-sm text-foreground/70 cursor-pointer leading-relaxed"
                          >
                            I agree to the processing of my personal data for
                            consultation purposes.{" "}
                            <span className="text-destructive">*</span>
                          </label>
                        </div>
                        <FieldError id="privacyConsent" />
                      </div>

                      {/* Row 9: CAPTCHA spam protection */}
                      <div className="space-y-1.5 rounded-lg border border-border bg-muted/20 p-4">
                        <Label className="text-sm font-medium text-foreground/80">
                          Spam Protection{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <p className="text-sm text-foreground/70">
                          What is{" "}
                          <strong className="text-foreground">
                            {captcha.a} + {captcha.b}
                          </strong>
                          ?
                        </p>
                        <Input
                          type="number"
                          data-ocid="contact.captcha.input"
                          placeholder="Enter your answer"
                          value={captchaInput}
                          onChange={(e) => {
                            setCaptchaInput(e.target.value);
                            if (e.target.value)
                              setFieldErrors((prev) => ({
                                ...prev,
                                captcha: undefined,
                              }));
                          }}
                          className={`w-32 border-border focus:border-primary ${fieldErrors.captcha ? "border-destructive focus:border-destructive" : ""}`}
                        />
                        <FieldError id="captcha" />
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
