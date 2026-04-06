import { motion } from "motion/react";
import { SiWhatsapp } from "react-icons/si";

export default function WhatsAppButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50 w-14 h-14">
      {/* Pulse rings */}
      <span
        className="absolute inset-0 rounded-full animate-wa-pulse"
        style={{ backgroundColor: "rgba(37,211,102,0.5)" }}
      />
      <span
        className="absolute inset-0 rounded-full animate-wa-pulse"
        style={{
          backgroundColor: "rgba(37,211,102,0.35)",
          animationDelay: "1s",
        }}
      />
      <motion.a
        href="https://wa.me/250795780073"
        target="_blank"
        rel="noopener noreferrer"
        data-ocid="whatsapp.button"
        aria-label="Chat with us on WhatsApp"
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
        style={{ backgroundColor: "#25D366" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 300, damping: 20 }}
      >
        <SiWhatsapp size={28} color="white" />
      </motion.a>
    </div>
  );
}
