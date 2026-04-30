import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SectionTypeOption {
  type: string;
  label: string;
  description: string;
  icon: string;
}

const SECTION_TYPES: SectionTypeOption[] = [
  {
    type: "hero",
    label: "Hero Section",
    description: "Full-width hero with headline, image and CTA button",
    icon: "🏆",
  },
  {
    type: "text-block",
    label: "Text Block",
    description: "Headline and paragraph content",
    icon: "📝",
  },
  {
    type: "image-block",
    label: "Image Block",
    description: "Single centered image with optional caption",
    icon: "🖼️",
  },
  {
    type: "two-column",
    label: "Two Column",
    description: "Text on one side, image on the other",
    icon: "⬛⬛",
  },
  {
    type: "about-preview",
    label: "About Preview",
    description: "Two column about section with image and CTA",
    icon: "ℹ️",
  },
  {
    type: "cta-section",
    label: "CTA Section",
    description: "Call to action with headline and buttons",
    icon: "🎯",
  },
  {
    type: "services-grid",
    label: "Services Grid",
    description: "Grid of service cards with icons",
    icon: "⚙️",
  },
  {
    type: "countries-grid",
    label: "Countries Grid",
    description: "Country flags and apply buttons",
    icon: "🌍",
  },
  {
    type: "team-section",
    label: "Team Section",
    description: "Team photo with headline",
    icon: "👥",
  },
  {
    type: "testimonials",
    label: "Testimonials",
    description: "Client success stories carousel",
    icon: "⭐",
  },
  {
    type: "blog-preview",
    label: "Blog Preview",
    description: "Latest 3 blog posts preview",
    icon: "📰",
  },
  {
    type: "why-choose",
    label: "Why Choose Us",
    description: "Feature highlights grid",
    icon: "✅",
  },
  {
    type: "contact-info",
    label: "Contact Info",
    description: "Phone, email, address, and WhatsApp",
    icon: "📞",
  },
  {
    type: "button-block",
    label: "Button Block",
    description: "A single large CTA button",
    icon: "🔘",
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
}

export default function SectionTypePicker({ open, onClose, onSelect }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[80vh] flex flex-col"
        data-ocid="we.section_picker.dialog"
      >
        <DialogHeader>
          <DialogTitle>Add a Section</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Choose a section type to insert into your page.
          </p>
        </DialogHeader>

        <div className="overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
          {SECTION_TYPES.map((st) => (
            <button
              key={st.type}
              type="button"
              onClick={() => onSelect(st.type)}
              data-ocid={`we.section_picker.${st.type}.button`}
              className="group flex flex-col items-start gap-2 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left cursor-pointer"
            >
              <span className="text-2xl">{st.icon}</span>
              <div>
                <p className="font-semibold text-sm text-gray-800 group-hover:text-blue-700 transition-colors">
                  {st.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">
                  {st.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
