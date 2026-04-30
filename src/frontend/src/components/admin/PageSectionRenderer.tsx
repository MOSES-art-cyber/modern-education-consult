import { Link } from "@tanstack/react-router";
import { CheckCircle, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useRef, useState } from "react";
import { SiWhatsapp } from "react-icons/si";
import {
  useGetAllBlogPosts,
  useGetAllTestimonials,
} from "../../hooks/useQueries";
import type { PageSection } from "../../types/index";

interface Props {
  section: PageSection;
  isEditing: boolean;
  onEditField: (key: string, value: string) => void;
  onImagePick: (fieldKey: string) => void;
}

function getField(section: PageSection, key: string, fallback = "") {
  return section.fields.find((f) => f.key === key)?.value ?? fallback;
}

function EditableText({
  value,
  onBlur,
  className,
  tag: Tag = "span",
  isEditing,
  placeholder,
}: {
  value: string;
  onBlur: (v: string) => void;
  className?: string;
  tag?: "span" | "p" | "h1" | "h2" | "h3" | "h4";
  isEditing: boolean;
  placeholder?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  if (!isEditing) {
    return <Tag className={className}>{value || placeholder}</Tag>;
  }
  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      contentEditable
      suppressContentEditableWarning
      className={`${className} outline-none ring-2 ring-cyan-400/60 ring-inset rounded cursor-text min-w-[40px]`}
      onBlur={(e) => onBlur(e.currentTarget.textContent ?? "")}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {value || placeholder}
    </Tag>
  );
}

function ImageField({
  src,
  alt,
  className,
  fieldKey,
  isEditing,
  onImagePick,
}: {
  src: string;
  alt: string;
  className?: string;
  fieldKey: string;
  isEditing: boolean;
  onImagePick: (key: string) => void;
}) {
  const [imgError, setImgError] = useState(false);

  if (!src || imgError) {
    return (
      <div
        className={`${className} bg-gray-200 flex items-center justify-center relative`}
        onClick={(e) => {
          if (isEditing) {
            e.stopPropagation();
            onImagePick(fieldKey);
          }
        }}
        onKeyDown={() => {}}
        role={isEditing ? "button" : undefined}
        tabIndex={isEditing ? 0 : undefined}
      >
        <span className="text-gray-400 text-sm">No image</span>
        {isEditing && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded">
            <span className="text-white text-xs font-medium bg-blue-600 px-3 py-1.5 rounded-lg">
              Click to set image
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative"
      onClick={(e) => {
        if (isEditing) {
          e.stopPropagation();
          onImagePick(fieldKey);
        }
      }}
      onKeyDown={() => {}}
      role={isEditing ? "button" : undefined}
      tabIndex={isEditing ? 0 : undefined}
    >
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setImgError(true)}
      />
      {isEditing && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded">
          <span className="text-white text-xs font-medium bg-blue-600 px-3 py-1.5 rounded-lg">
            Replace Image
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Section renderers ────────────────────────────────────────────────────────

function HeroSection({ section, isEditing, onEditField, onImagePick }: Props) {
  const heading = getField(
    section,
    "heading",
    "Your Gateway to Global Opportunities",
  );
  const subheading = getField(
    section,
    "subheading",
    "Professional guidance for studying and working abroad.",
  );
  const ctaText = getField(section, "ctaText", "Apply Now");
  const ctaLink = getField(section, "ctaLink", "/contact");
  const heroImage = getField(
    section,
    "heroImage",
    "/assets/generated/hero-banner.dim_1600x700.jpg",
  );

  return (
    <div
      className="relative min-h-[400px] flex items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.22 0.08 262) 0%, oklch(0.35 0.12 262) 50%, oklch(0.28 0.1 258) 100%)",
      }}
    >
      {heroImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.08 262 / 0.85) 0%, oklch(0.35 0.12 262 / 0.8) 100%)",
        }}
      />

      {isEditing && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onImagePick("heroImage");
          }}
          className="absolute top-3 right-3 z-20 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          Replace Background
        </button>
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
        <EditableText
          tag="h1"
          value={heading}
          onBlur={(v) => onEditField("heading", v)}
          className="font-display font-bold text-white text-4xl sm:text-5xl leading-tight mb-4"
          isEditing={isEditing}
          placeholder="Your Headline"
        />
        <EditableText
          tag="p"
          value={subheading}
          onBlur={(v) => onEditField("subheading", v)}
          className="text-white/80 text-lg max-w-2xl mx-auto mb-8"
          isEditing={isEditing}
          placeholder="Subheadline"
        />
        {isEditing ? (
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2 border border-white/30">
            <EditableText
              value={ctaText}
              onBlur={(v) => onEditField("ctaText", v)}
              className="text-white font-bold text-sm"
              isEditing={isEditing}
              placeholder="Button Text"
            />
            <span className="text-white/50 text-xs">→</span>
            <EditableText
              value={ctaLink}
              onBlur={(v) => onEditField("ctaLink", v)}
              className="text-white/70 text-xs"
              isEditing={isEditing}
              placeholder="/contact"
            />
          </div>
        ) : (
          <Link
            to={ctaLink as "/contact"}
            className="inline-flex items-center gap-2 bg-white hover:bg-white/90 text-[#1e3a5f] font-bold px-8 py-3 rounded-lg shadow-lg transition-all"
          >
            {ctaText}
          </Link>
        )}
      </div>
    </div>
  );
}

function TextBlockSection({ section, isEditing, onEditField }: Props) {
  const title = getField(section, "title");
  const content = getField(section, "content");

  return (
    <div className="py-16 px-6 max-w-3xl mx-auto">
      {title && (
        <EditableText
          tag="h2"
          value={title}
          onBlur={(v) => onEditField("title", v)}
          className="font-display font-bold text-2xl text-[#1e3a5f] mb-4"
          isEditing={isEditing}
          placeholder="Section Title"
        />
      )}
      <EditableText
        tag="p"
        value={content}
        onBlur={(v) => onEditField("content", v)}
        className="text-gray-600 text-base leading-relaxed"
        isEditing={isEditing}
        placeholder="Add your content here..."
      />
    </div>
  );
}

function ImageBlockSection({
  section,
  isEditing,
  onEditField,
  onImagePick,
}: Props) {
  const src = getField(section, "src");
  const caption = getField(section, "caption");
  const alignment = getField(section, "alignment", "center");
  const alignMap = { left: "mr-auto", center: "mx-auto", right: "ml-auto" };
  const cls = alignMap[alignment as keyof typeof alignMap] ?? "mx-auto";

  return (
    <div className="py-12 px-6">
      <div className={`max-w-2xl ${cls}`}>
        <ImageField
          src={src}
          alt={getField(section, "alt")}
          className="w-full rounded-xl shadow-md"
          fieldKey="src"
          isEditing={isEditing}
          onImagePick={onImagePick}
        />
        {caption && (
          <EditableText
            tag="p"
            value={caption}
            onBlur={(v) => onEditField("caption", v)}
            className="text-center text-sm text-gray-500 mt-2 italic"
            isEditing={isEditing}
            placeholder="Image caption"
          />
        )}
      </div>
    </div>
  );
}

function TwoColumnSection({
  section,
  isEditing,
  onEditField,
  onImagePick,
}: Props) {
  const heading = getField(section, "heading", "Two Column Section");
  const text = getField(section, "text");
  const image = getField(section, "image");
  const imagePos = getField(section, "imagePosition", "right");

  const textBlock = (
    <div className="flex flex-col justify-center">
      <EditableText
        tag="h2"
        value={heading}
        onBlur={(v) => onEditField("heading", v)}
        className="font-display font-bold text-3xl text-[#1e3a5f] mb-4"
        isEditing={isEditing}
        placeholder="Heading"
      />
      <EditableText
        tag="p"
        value={text}
        onBlur={(v) => onEditField("text", v)}
        className="text-gray-600 text-base leading-relaxed"
        isEditing={isEditing}
        placeholder="Content text..."
      />
    </div>
  );

  const imgBlock = (
    <ImageField
      src={image}
      alt={getField(section, "imageAlt")}
      className="w-full rounded-xl shadow-md object-cover"
      fieldKey="image"
      isEditing={isEditing}
      onImagePick={onImagePick}
    />
  );

  return (
    <div className="py-16 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {imagePos === "left" ? (
          <>
            {imgBlock}
            {textBlock}
          </>
        ) : (
          <>
            {textBlock}
            {imgBlock}
          </>
        )}
      </div>
    </div>
  );
}

function CtaSection({ section, isEditing, onEditField }: Props) {
  const heading = getField(section, "heading", "Ready to Get Started?");
  const text = getField(section, "text");
  const ctaText = getField(section, "ctaText", "Apply Now");
  const ctaLink = getField(section, "ctaLink", "/contact");
  const cta2Text = getField(section, "cta2Text", "Learn More");
  const cta2Link = getField(section, "cta2Link", "/about");

  return (
    <div
      className="py-20 px-6 text-center"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.22 0.08 262) 0%, oklch(0.35 0.12 262) 100%)",
      }}
    >
      <div className="max-w-3xl mx-auto">
        <EditableText
          tag="h2"
          value={heading}
          onBlur={(v) => onEditField("heading", v)}
          className="font-display font-bold text-3xl sm:text-4xl text-white mb-4"
          isEditing={isEditing}
          placeholder="Section Heading"
        />
        <EditableText
          tag="p"
          value={text}
          onBlur={(v) => onEditField("text", v)}
          className="text-white/70 text-lg mb-8"
          isEditing={isEditing}
          placeholder="Section description..."
        />
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isEditing ? (
            <>
              <div className="inline-flex items-center gap-2 bg-white rounded-lg px-4 py-2 border border-gray-300">
                <EditableText
                  value={ctaText}
                  onBlur={(v) => onEditField("ctaText", v)}
                  className="font-bold text-[#1e3a5f] text-sm"
                  isEditing={isEditing}
                  placeholder="Button 1"
                />
                <span className="text-gray-300 text-xs">|</span>
                <EditableText
                  value={ctaLink}
                  onBlur={(v) => onEditField("ctaLink", v)}
                  className="text-gray-500 text-xs"
                  isEditing={isEditing}
                  placeholder="/link"
                />
              </div>
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2 border border-white/30">
                <EditableText
                  value={cta2Text}
                  onBlur={(v) => onEditField("cta2Text", v)}
                  className="font-bold text-white text-sm"
                  isEditing={isEditing}
                  placeholder="Button 2"
                />
                <span className="text-white/30 text-xs">|</span>
                <EditableText
                  value={cta2Link}
                  onBlur={(v) => onEditField("cta2Link", v)}
                  className="text-white/50 text-xs"
                  isEditing={isEditing}
                  placeholder="/link"
                />
              </div>
            </>
          ) : (
            <>
              <Link
                to={ctaLink as "/contact"}
                className="inline-block bg-white hover:bg-white/90 text-[#1e3a5f] font-bold px-8 py-3 rounded-lg shadow-lg transition-all"
              >
                {ctaText}
              </Link>
              <Link
                to={cta2Link as "/about"}
                className="inline-block border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-all"
              >
                {cta2Text}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ServicesGridSection({ section, isEditing, onEditField }: Props) {
  const heading = getField(section, "heading", "Our Services");
  const subheading = getField(
    section,
    "subheading",
    "Comprehensive solutions for your international journey.",
  );

  const services = [
    {
      icon: "🎓",
      name: "Study Abroad",
      desc: "University admissions and scholarship support.",
    },
    {
      icon: "💼",
      name: "Job Placement",
      desc: "International employment and career guidance.",
    },
    {
      icon: "📋",
      name: "Visa Assistance",
      desc: "Expert visa processing and documentation.",
    },
    {
      icon: "💰",
      name: "Scholarships",
      desc: "Financial aid and scholarship applications.",
    },
    {
      icon: "🌐",
      name: "Online Courses",
      desc: "Accredited international online degrees.",
    },
    {
      icon: "🤝",
      name: "Internships",
      desc: "Hands-on global work experience placements.",
    },
  ];

  return (
    <div className="py-16 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <EditableText
            tag="h2"
            value={heading}
            onBlur={(v) => onEditField("heading", v)}
            className="font-display font-bold text-3xl text-[#1e3a5f] mb-2"
            isEditing={isEditing}
            placeholder="Section Heading"
          />
          <EditableText
            tag="p"
            value={subheading}
            onBlur={(v) => onEditField("subheading", v)}
            className="text-gray-500 text-base"
            isEditing={isEditing}
            placeholder="Subheading..."
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s.name}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-3">{s.icon}</div>
              <h3 className="font-bold text-[#1e3a5f] text-base mb-2">
                {s.name}
              </h3>
              <p className="text-gray-500 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CountriesGridSection({ section, isEditing, onEditField }: Props) {
  const heading = getField(section, "heading", "Countries We Serve");
  const countries = [
    { flag: "🇺🇸", name: "USA" },
    { flag: "🇨🇦", name: "Canada" },
    { flag: "🇬🇧", name: "UK" },
    { flag: "🇦🇪", name: "UAE" },
    { flag: "🇪🇺", name: "Europe" },
    { flag: "🇨🇳", name: "China" },
    { flag: "🇦🇺", name: "Australia" },
  ];

  return (
    <div className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <EditableText
            tag="h2"
            value={heading}
            onBlur={(v) => onEditField("heading", v)}
            className="font-display font-bold text-3xl text-[#1e3a5f] mb-2"
            isEditing={isEditing}
            placeholder="Heading"
          />
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {countries.map((c) => (
            <Link
              key={c.name}
              to="/contact"
              search={{ country: c.name }}
              className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-gray-50 border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-sm font-semibold text-[#1e3a5f]"
            >
              <span className="text-2xl">{c.flag}</span>
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamSection({ section, isEditing, onEditField, onImagePick }: Props) {
  const heading = getField(section, "heading", "Meet Our Team");
  const image = getField(
    section,
    "image",
    "/assets/uploads/WhatsApp-Image-2026-03-05-at-12.08.05-1.jpeg",
  );

  return (
    <div className="py-16 px-6 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <EditableText
          tag="h2"
          value={heading}
          onBlur={(v) => onEditField("heading", v)}
          className="font-display font-bold text-3xl text-[#1e3a5f] mb-8"
          isEditing={isEditing}
          placeholder="Team Heading"
        />
        <ImageField
          src={image}
          alt="Our Team"
          className="w-full rounded-2xl shadow-lg object-cover max-h-80"
          fieldKey="image"
          isEditing={isEditing}
          onImagePick={onImagePick}
        />
      </div>
    </div>
  );
}

function ContactInfoSection({ section, isEditing, onEditField }: Props) {
  const phone = getField(section, "phone", "+250 798979720");
  const whatsapp = getField(section, "whatsapp", "+250 795780073");
  const email = getField(
    section,
    "email",
    "moderneducationconsult2026@gmail.com",
  );
  const address = getField(section, "address", "Kigali, Musanze, Rwanda");

  return (
    <div className="py-16 px-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display font-bold text-2xl text-[#1e3a5f] mb-6 text-center">
          Contact Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm border border-gray-100">
            <Phone size={18} className="text-blue-600 flex-shrink-0" />
            <EditableText
              value={phone}
              onBlur={(v) => onEditField("phone", v)}
              className="text-sm text-gray-700"
              isEditing={isEditing}
            />
          </div>
          <div className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm border border-gray-100">
            <MessageCircle size={18} className="text-green-500 flex-shrink-0" />
            <EditableText
              value={whatsapp}
              onBlur={(v) => onEditField("whatsapp", v)}
              className="text-sm text-gray-700"
              isEditing={isEditing}
            />
          </div>
          <div className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm border border-gray-100">
            <Mail size={18} className="text-blue-600 flex-shrink-0" />
            <EditableText
              value={email}
              onBlur={(v) => onEditField("email", v)}
              className="text-sm text-gray-700 break-all"
              isEditing={isEditing}
            />
          </div>
          <div className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm border border-gray-100">
            <MapPin size={18} className="text-red-500 flex-shrink-0" />
            <EditableText
              value={address}
              onBlur={(v) => onEditField("address", v)}
              className="text-sm text-gray-700"
              isEditing={isEditing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ButtonBlockSection({ section, isEditing, onEditField }: Props) {
  const text = getField(section, "text", "Click Here");
  const link = getField(section, "link", "/contact");

  return (
    <div className="py-10 px-6 flex justify-center">
      {isEditing ? (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-3">
          <EditableText
            value={text}
            onBlur={(v) => onEditField("text", v)}
            className="font-bold text-blue-700 text-sm"
            isEditing={isEditing}
            placeholder="Button text"
          />
          <span className="text-blue-300">→</span>
          <EditableText
            value={link}
            onBlur={(v) => onEditField("link", v)}
            className="text-blue-400 text-xs"
            isEditing={isEditing}
            placeholder="/link"
          />
        </div>
      ) : (
        <Link
          to={link as "/contact"}
          className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold px-10 py-4 rounded-xl shadow-lg transition-all text-base"
        >
          {text}
        </Link>
      )}
    </div>
  );
}

function TestimonialsSection() {
  const { data: testimonials = [] } = useGetAllTestimonials();
  const display =
    testimonials.length > 0
      ? testimonials.slice(0, 3)
      : [
          {
            clientName: "Amina Uwase",
            country: "Now studying in Canada",
            quote: "Modern Education Consult made my dream a reality.",
            photoUrl: "",
          },
          {
            clientName: "Jean-Pierre Niyonzima",
            country: "Working in UAE",
            quote: "Exceptional support throughout the entire process.",
            photoUrl: "",
          },
          {
            clientName: "Claudine Mukamana",
            country: "Studying in UK",
            quote: "The scholarship support they provided saved me thousands.",
            photoUrl: "",
          },
        ];

  return (
    <div className="py-16 px-6 bg-[#1e3a5f]">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-display font-bold text-3xl text-white mb-8 text-center">
          Client Success Stories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {display.map((t) => (
            <div key={t.clientName} className="bg-white/10 rounded-xl p-5">
              <p className="text-white/80 text-sm italic mb-4">"{t.quote}"</p>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">
                  {t.clientName.charAt(0)}
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">
                    {t.clientName}
                  </p>
                  <p className="text-white/60 text-[10px]">{t.country}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlogPreviewSection() {
  const { data: posts = [] } = useGetAllBlogPosts();
  const latest = posts.slice(0, 3);

  if (latest.length === 0) {
    return (
      <div className="py-12 px-6 text-center text-gray-400">
        <p className="text-sm">Blog posts will appear here once published.</p>
      </div>
    );
  }

  return (
    <div className="py-16 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-display font-bold text-3xl text-[#1e3a5f] mb-8 text-center">
          Latest from Our Blog
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {latest.map((post) => (
            <div
              key={post.id.toString()}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
            >
              <div className="h-40 bg-gradient-to-br from-[#1e3a5f] to-[#1d4ed8] relative overflow-hidden">
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                <span className="text-xs text-blue-600 font-semibold">
                  {post.category}
                </span>
                <h3 className="font-bold text-[#1e3a5f] text-sm mt-1 line-clamp-2">
                  {post.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AboutPreviewSection({
  section,
  isEditing,
  onEditField,
  onImagePick,
}: Props) {
  const heading = getField(
    section,
    "heading",
    "About Modern Education Consult",
  );
  const text = getField(
    section,
    "text",
    "We provide professional guidance for international education and career opportunities.",
  );
  const image = getField(
    section,
    "image",
    "/assets/uploads/WhatsApp-Image-2026-03-05-at-12.08.05-1.jpeg",
  );
  const ctaText = getField(section, "ctaText", "Learn More");
  const ctaLink = getField(section, "ctaLink", "/about");

  return (
    <div className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <EditableText
            tag="h2"
            value={heading}
            onBlur={(v) => onEditField("heading", v)}
            className="font-display font-bold text-3xl text-[#1e3a5f] mb-4"
            isEditing={isEditing}
            placeholder="Heading"
          />
          <EditableText
            tag="p"
            value={text}
            onBlur={(v) => onEditField("text", v)}
            className="text-gray-600 text-base leading-relaxed mb-6"
            isEditing={isEditing}
            placeholder="Description..."
          />
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-blue-600" />
            <span className="text-sm text-gray-600">
              Professional and Ethical Services
            </span>
          </div>
          {!isEditing && (
            <Link
              to={ctaLink as "/about"}
              className="inline-block mt-6 border-2 border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white font-semibold px-5 py-2.5 rounded-lg transition-all text-sm"
            >
              {ctaText}
            </Link>
          )}
        </div>
        <ImageField
          src={image}
          alt="About us"
          className="w-full rounded-2xl shadow-lg object-cover"
          fieldKey="image"
          isEditing={isEditing}
          onImagePick={onImagePick}
        />
      </div>
    </div>
  );
}

function WhyChooseSection({ section, isEditing, onEditField }: Props) {
  const heading = getField(section, "heading", "Why Choose Us");
  const items = [
    {
      icon: "🛡️",
      title: "Professional & Ethical",
      desc: "We uphold the highest standards.",
    },
    {
      icon: "✅",
      title: "Transparent Process",
      desc: "Clear guidance with no hidden fees.",
    },
    {
      icon: "👥",
      title: "Personalized Support",
      desc: "Tailored advice for your goals.",
    },
    {
      icon: "🌐",
      title: "Global Network",
      desc: "Partners worldwide for your success.",
    },
    {
      icon: "📚",
      title: "Step-by-Step Guidance",
      desc: "Support from start to placement.",
    },
  ];

  return (
    <div className="py-16 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <EditableText
            tag="h2"
            value={heading}
            onBlur={(v) => onEditField("heading", v)}
            className="font-display font-bold text-3xl text-[#1e3a5f]"
            isEditing={isEditing}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <span className="text-2xl block mb-2">{item.icon}</span>
              <h3 className="font-bold text-[#1e3a5f] text-sm mb-1">
                {item.title}
              </h3>
              <p className="text-gray-500 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DefaultSection({ section }: { section: PageSection }) {
  return (
    <div className="py-10 px-6 bg-gray-50 flex items-center justify-center text-center">
      <div>
        <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-2">
          {section.sectionType}
        </span>
        <p className="text-gray-400 text-sm">
          This section type ({section.sectionType}) will render dynamically on
          the live site.
        </p>
      </div>
    </div>
  );
}

// ─── Main renderer ────────────────────────────────────────────────────────────

export default function PageSectionRenderer({
  section,
  isEditing,
  onEditField,
  onImagePick,
}: Props) {
  switch (section.sectionType) {
    case "hero":
    case "hero-section":
      return (
        <HeroSection
          section={section}
          isEditing={isEditing}
          onEditField={onEditField}
          onImagePick={onImagePick}
        />
      );
    case "text-block":
    case "textBlock":
      return (
        <TextBlockSection
          section={section}
          isEditing={isEditing}
          onEditField={onEditField}
          onImagePick={onImagePick}
        />
      );
    case "image-block":
    case "imageBlock":
      return (
        <ImageBlockSection
          section={section}
          isEditing={isEditing}
          onEditField={onEditField}
          onImagePick={onImagePick}
        />
      );
    case "two-column":
      return (
        <TwoColumnSection
          section={section}
          isEditing={isEditing}
          onEditField={onEditField}
          onImagePick={onImagePick}
        />
      );
    case "cta-section":
      return (
        <CtaSection
          section={section}
          isEditing={isEditing}
          onEditField={onEditField}
          onImagePick={onImagePick}
        />
      );
    case "services-grid":
      return (
        <ServicesGridSection
          section={section}
          isEditing={isEditing}
          onEditField={onEditField}
          onImagePick={onImagePick}
        />
      );
    case "countries-grid":
      return (
        <CountriesGridSection
          section={section}
          isEditing={isEditing}
          onEditField={onEditField}
          onImagePick={onImagePick}
        />
      );
    case "team-section":
      return (
        <TeamSection
          section={section}
          isEditing={isEditing}
          onEditField={onEditField}
          onImagePick={onImagePick}
        />
      );
    case "contact-info":
      return (
        <ContactInfoSection
          section={section}
          isEditing={isEditing}
          onEditField={onEditField}
          onImagePick={onImagePick}
        />
      );
    case "button-block":
    case "buttonBlock":
      return (
        <ButtonBlockSection
          section={section}
          isEditing={isEditing}
          onEditField={onEditField}
          onImagePick={onImagePick}
        />
      );
    case "testimonials":
      return <TestimonialsSection />;
    case "blog-preview":
      return <BlogPreviewSection />;
    case "about-preview":
      return (
        <AboutPreviewSection
          section={section}
          isEditing={isEditing}
          onEditField={onEditField}
          onImagePick={onImagePick}
        />
      );
    case "why-choose":
      return (
        <WhyChooseSection
          section={section}
          isEditing={isEditing}
          onEditField={onEditField}
          onImagePick={onImagePick}
        />
      );
    default:
      return <DefaultSection section={section} />;
  }
}
