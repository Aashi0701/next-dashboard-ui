"use client";

import { FiSend } from "react-icons/fi";

export default function AnnouncementCard({
  item,
  role,
  onSend,
  onRead,
}: {
  item: any;
  role?: string;
  onSend: (item: any) => void;
  onRead: (id: number) => void;
}) {
  const isUnread = item.reads.length === 0;
  const isLatest =
    isUnread &&
    Date.now() - new Date(item.date).getTime() < 48 * 60 * 60 * 1000;

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm space-y-3 mt-2">
      {/* ===== HEADER ===== */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {isUnread && (
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          )}

          {isLatest && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
              Latest
            </span>
          )}
        </div>

        <span className="text-xs text-gray-500">
          {new Date(item.date).toLocaleDateString("en-IN")}
        </span>
      </div>

      {/* ===== TITLE ===== */}
      <button
        onClick={() => onRead(item.id)}
        className="text-left font-semibold text-sm text-gray-900 leading-snug"
      >
        {item.title}
      </button>

      {/* ===== META ===== */}
      <div className="text-xs text-gray-500">
        Class:{" "}
        <span className="font-medium text-gray-700">
          {item.class?.name || "All Classes"}
        </span>
      </div>

      {/* ===== ACTIONS ===== */}
      {role === "admin" && (
        <div className="pt-3 border-t flex items-center justify-between gap-3">
          {/* LEFT: WhatsApp */}
          {!item.whatsappSent && (
            <button
              onClick={() => onSend(item)}
              className="
                flex items-center gap-2
                px-3 py-1.5 text-xs rounded-full
                bg-green-50 border border-green-200
                text-green-700 hover:bg-green-100
              "
            >
              <FiSend className="w-3.5 h-3.5" />
              Send
            </button>
          )}

          {/* RIGHT: EDIT / DELETE */}
          {item.actions && (
            <div className="flex items-center gap-2">
              {item.actions}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
