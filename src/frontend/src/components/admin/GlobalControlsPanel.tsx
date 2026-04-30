import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowDown, ArrowUp, Plus, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useGetGlobalConfig,
  useUpdateGlobalConfig,
} from "../../hooks/useQueries";
import type { GlobalConfig, NavMenuItem } from "../../types/index";
import MediaPickerModal from "./MediaPickerModal";

export default function GlobalControlsPanel() {
  const { data: config, isLoading } = useGetGlobalConfig();
  const updateConfig = useUpdateGlobalConfig();
  const [showLogoPicker, setShowLogoPicker] = useState(false);

  const [form, setForm] = useState<GlobalConfig>({
    siteTitle: "Modern Education Consult",
    contactPhone: "+250 798979720",
    contactEmail: "moderneducationconsult2026@gmail.com",
    contactAddress: "Kigali, Musanze, Rwanda",
    footerContent: "Where education meets opportunities",
    navigationMenu: [],
    updatedAt: BigInt(0),
  });

  useEffect(() => {
    if (config) {
      setForm({
        ...config,
        navigationMenu: [...config.navigationMenu].sort(
          (a, b) => Number(a.order) - Number(b.order),
        ),
      });
    }
  }, [config]);

  const setField = (
    key: keyof Omit<
      GlobalConfig,
      "navigationMenu" | "logoMediaId" | "updatedAt"
    >,
    value: string,
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleNavChange = (
    idx: number,
    field: "text" | "url",
    value: string,
  ) => {
    setForm((f) => ({
      ...f,
      navigationMenu: f.navigationMenu.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const handleNavAdd = () => {
    const newItem: NavMenuItem = {
      id: BigInt(Date.now()),
      text: "New Item",
      url: "/",
      order: BigInt(form.navigationMenu.length),
    };
    setForm((f) => ({ ...f, navigationMenu: [...f.navigationMenu, newItem] }));
  };

  const handleNavDelete = (idx: number) => {
    setForm((f) => ({
      ...f,
      navigationMenu: f.navigationMenu.filter((_, i) => i !== idx),
    }));
  };

  const handleNavMoveUp = (idx: number) => {
    if (idx === 0) return;
    setForm((f) => {
      const nav = [...f.navigationMenu];
      [nav[idx - 1], nav[idx]] = [nav[idx], nav[idx - 1]];
      return { ...f, navigationMenu: nav };
    });
  };

  const handleNavMoveDown = (idx: number) => {
    setForm((f) => {
      if (idx >= f.navigationMenu.length - 1) return f;
      const nav = [...f.navigationMenu];
      [nav[idx], nav[idx + 1]] = [nav[idx + 1], nav[idx]];
      return { ...f, navigationMenu: nav };
    });
  };

  const handleSave = async () => {
    const normalized: GlobalConfig = {
      ...form,
      updatedAt: BigInt(Date.now()),
      navigationMenu: form.navigationMenu.map((item, idx) => ({
        ...item,
        order: BigInt(idx),
      })),
    };
    try {
      await updateConfig.mutateAsync(normalized);
      toast.success("Global settings saved!");
    } catch (e) {
      toast.error(`Failed: ${e instanceof Error ? e.message : "Unknown"}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-10 rounded-lg bg-slate-700/40 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4" data-ocid="we.global.panel">
      {/* Branding */}
      <Section title="Branding">
        <FieldRow label="Site Title">
          <Input
            value={form.siteTitle}
            onChange={(e) => setField("siteTitle", e.target.value)}
            className="h-7 text-xs bg-slate-800 border-slate-600 text-white"
            data-ocid="we.global.site_title.input"
          />
        </FieldRow>
        <FieldRow label="Logo">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowLogoPicker(true)}
            className="h-7 text-xs border-slate-600 text-slate-300 hover:bg-slate-700"
            data-ocid="we.global.logo_picker.button"
          >
            Replace Logo
          </Button>
        </FieldRow>
      </Section>

      {/* Contact Info */}
      <Section title="Contact Information">
        <FieldRow label="Phone">
          <Input
            value={form.contactPhone}
            onChange={(e) => setField("contactPhone", e.target.value)}
            className="h-7 text-xs bg-slate-800 border-slate-600 text-white"
            data-ocid="we.global.phone.input"
          />
        </FieldRow>
        <FieldRow label="Email">
          <Input
            value={form.contactEmail}
            onChange={(e) => setField("contactEmail", e.target.value)}
            className="h-7 text-xs bg-slate-800 border-slate-600 text-white"
            data-ocid="we.global.email.input"
          />
        </FieldRow>
        <FieldRow label="Address">
          <Input
            value={form.contactAddress}
            onChange={(e) => setField("contactAddress", e.target.value)}
            className="h-7 text-xs bg-slate-800 border-slate-600 text-white"
            data-ocid="we.global.address.input"
          />
        </FieldRow>
      </Section>

      {/* Footer */}
      <Section title="Footer">
        <div className="space-y-1">
          <Label className="text-[10px] text-slate-400">Footer Tagline</Label>
          <Textarea
            value={form.footerContent}
            onChange={(e) => setField("footerContent", e.target.value)}
            rows={2}
            className="text-xs bg-slate-800 border-slate-600 text-white resize-none"
            data-ocid="we.global.footer.textarea"
          />
        </div>
      </Section>

      {/* Navigation Menu */}
      <Section title="Navigation Menu">
        <div className="space-y-1.5" data-ocid="we.global.nav.list">
          {form.navigationMenu.length === 0 ? (
            <p
              className="text-xs text-slate-500 text-center py-2"
              data-ocid="we.global.nav.empty_state"
            >
              No menu items yet.
            </p>
          ) : (
            form.navigationMenu.map((item, idx) => (
              <div
                key={item.id.toString()}
                data-ocid={`we.global.nav.item.${idx + 1}`}
                className="flex items-center gap-1 bg-slate-800/60 rounded-lg p-1.5 border border-slate-700"
              >
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleNavMoveUp(idx)}
                    disabled={idx === 0}
                    className="p-0.5 rounded text-slate-500 hover:text-slate-300 disabled:opacity-30 transition-colors"
                    aria-label="Move up"
                  >
                    <ArrowUp size={10} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavMoveDown(idx)}
                    disabled={idx === form.navigationMenu.length - 1}
                    className="p-0.5 rounded text-slate-500 hover:text-slate-300 disabled:opacity-30 transition-colors"
                    aria-label="Move down"
                  >
                    <ArrowDown size={10} />
                  </button>
                </div>
                <Input
                  value={item.text}
                  onChange={(e) => handleNavChange(idx, "text", e.target.value)}
                  placeholder="Label"
                  className="flex-1 h-6 text-xs bg-slate-700 border-slate-600 text-white min-w-0"
                  data-ocid={`we.global.nav.text.${idx + 1}`}
                />
                <Input
                  value={item.url}
                  onChange={(e) => handleNavChange(idx, "url", e.target.value)}
                  placeholder="/url"
                  className="flex-1 h-6 text-xs bg-slate-700 border-slate-600 text-white min-w-0"
                  data-ocid={`we.global.nav.url.${idx + 1}`}
                />
                <button
                  type="button"
                  onClick={() => handleNavDelete(idx)}
                  className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 shrink-0 transition-colors"
                  aria-label="Remove"
                  data-ocid={`we.global.nav.delete_button.${idx + 1}`}
                >
                  <X size={11} />
                </button>
              </div>
            ))
          )}
        </div>
        <button
          type="button"
          onClick={handleNavAdd}
          className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:text-cyan-400 hover:border-cyan-500 text-xs font-medium transition-colors mt-1"
          data-ocid="we.global.nav.add_item.button"
        >
          <Plus size={11} />
          Add Menu Item
        </button>
      </Section>

      {/* Save button */}
      <Button
        onClick={handleSave}
        disabled={updateConfig.isPending}
        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-xs h-8 gap-1.5"
        data-ocid="we.global.save_button"
      >
        <Save size={12} />
        {updateConfig.isPending ? "Saving..." : "Save Global Settings"}
      </Button>

      <MediaPickerModal
        open={showLogoPicker}
        onClose={() => setShowLogoPicker(false)}
        onSelect={() => {
          setShowLogoPicker(false);
          toast.success("Logo selected from library.");
        }}
        title="Select Logo Image"
      />
    </div>
  );
}

function Section({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/30 overflow-hidden">
      <div className="px-3 py-1.5 bg-slate-700/30 border-b border-slate-700">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
      </div>
      <div className="p-3 space-y-2.5">{children}</div>
    </div>
  );
}

function FieldRow({
  label,
  children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-400 w-14 shrink-0">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
