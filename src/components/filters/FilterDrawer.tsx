"use client";

import { useEffect } from "react";

type FilterDrawerProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export default function FilterDrawer({
  open,
  title = "Filters",
  onClose,
  children,
  footer,
}: FilterDrawerProps) {
  /* ================= LOCK BACKGROUND SCROLL ================= */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
      {/* CLICK OUTSIDE */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* DRAWER */}
      <div
        className="
          fixed bottom-0 left-0 right-0
          md:top-0 md:right-0 md:left-auto
          h-[55%] md:h-full
          max-h-[85vh] md:max-h-none
          md:w-80
          bg-white
          rounded-t-2xl md:rounded-none
          shadow-xl
          flex flex-col
        "
      >
        {/* HEADER */}
        <div className="flex justify-between items-center px-5 py-4 border-b">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-lg"
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="px-5 py-4 flex-1 overflow-y-auto space-y-4 text-sm">
          {children}
        </div>

        {/* FOOTER */}
        <div className="px-5 py-4 border-t">{footer}</div>
      </div>
    </div>
  );
}
