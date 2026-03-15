"use client";

import { useState } from "react";
import Table from "@/components/Table";
import { FiSend } from "react-icons/fi";
import AnnouncementCard from "@/components/mobile/AnnouncementCard";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import FormModal from "@/components/FormModal";

export default function AnnouncementTableClient({
  data,
  role,
}: {
  data: any[];
  role?: string;
}) {
  const [confirmItem, setConfirmItem] = useState<any | null>(null);

  /* ---------------- ACTIONS ---------------- */

  const markAsRead = async (id: number) => {
    await fetch("/api/announcements/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ announcementId: id }),
    });

    window.location.reload();
  };

  const markWhatsAppSent = async () => {
    if (!confirmItem) return;

    await fetch("/api/announcements/mark-whatsapp-sent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ announcementId: confirmItem.id }),
    });

    setConfirmItem(null);
    window.location.reload();
  };

  const buildWhatsAppMessage = (item: any) =>
    encodeURIComponent(
      `📢 *School Announcement*\n\n` +
        `*${item.title}*\n` +
        `Class: ${item.class?.name || "All Classes"}\n` +
        `Date: ${new Date(item.date).toLocaleDateString("en-IN")}`,
    );

  /* ---------------- TABLE CONFIG ---------------- */

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Class", accessor: "class" },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    ...(role === "admin"
      ? [
          {
            header: "Last Sent",
            accessor: "whatsapp",
            className: "text-center w-[140px]",
          },
          {
            header: "Actions",
            accessor: "actions",
            className: "text-center w-[160px]",
          },
        ]
      : []),
  ];

  const renderRow = (item: any) => {
    const isUnread = item.reads.length === 0;
    const isLatest =
      isUnread &&
      Date.now() - new Date(item.date).getTime() < 48 * 60 * 60 * 1000;

    const isSent = item.whatsappSent;

    return (
      <tr key={item.id} className="border-b border-gray-100 even:bg-slate-50 text-xs hover:bg-purple-50">
        {/* TITLE */}
        <td className="px-2 py-1.5 md:px-3 md:py-2 align-middle">
          <div className="flex items-center gap-2">
            {isUnread && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
            {isLatest && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                Latest
              </span>
            )}
            <button
              onClick={() => markAsRead(item.id)}
              className="font-medium hover:underline text-left"
            >
              {item.title}
            </button>
          </div>
        </td>

        {/* CLASS */}
        <td className="px-2 py-1.5 md:px-3 md:py-2 align-middle">
          {item.class?.name || "All Classes"}
        </td>

        {/* DATE */}
        <td className="px-2 py-1.5 md:px-3 md:py-2 align-middle hidden md:table-cell text-gray-500">
          {new Date(item.date).toLocaleDateString("en-IN")}
        </td>

        {/* ACTIONS */}
        {/* LAST SENT */}
        {role === "admin" && (
          <td className="px-2 py-1.5 md:px-3 md:py-2 align-middle text-center">
            {item.whatsappSent ? (
              <div className="text-[11px] text-gray-600">
                {new Date(item.whatsappSentAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            ) : (
              <span className="text-gray-400 text-sm">—</span>
            )}
          </td>
        )}

        {/* ACTIONS */}
        {role === "admin" && (
          <td className="px-2 py-1.5 md:px-3 md:py-2 align-middle text-center">
            <div className="flex items-center justify-center gap-3">
              {!item.whatsappSent && (
                <button
                  onClick={() => setConfirmItem(item)}
                  className="w-7 h-7 flex items-center justify-center rounded-full
          bg-green-50 border border-green-200 hover:bg-green-100"
                >
                  <FiSend className="w-4 h-4 text-green-600" />
                </button>
              )}

              <FormModal
                table="announcement"
                type="update"
                id={item.id}
                data={item}
              />

              <FormModal table="announcement" type="delete" id={item.id} />
            </div>
          </td>
        )}
      </tr>
    );
  };

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden md:block">
        <Table columns={columns} data={data} renderRow={renderRow} />
      </div>

      {/* MOBILE */}
      <div className="md:hidden space-y-3">
        {data.map((item) => (
          <AnnouncementCard
            key={item.id}
            item={item}
            role={role}
            onSend={(i) => setConfirmItem(i)}
            onRead={markAsRead}
          />
        ))}
      </div>

      {/* CONFIRM MODAL */}
      {confirmItem && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:w-[420px] rounded-t-2xl sm:rounded-xl px-4 py-4 sm:px-6 sm:py-5 shadow-xl">
            <div className="relative">
              <ModalCloseButton onClose={() => setConfirmItem(null)} />
              <h2 className="text-sm sm:text-lg font-semibold mb-1">
                Send Announcement?
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              WhatsApp will open. After sending, click{" "}
              <span className="font-medium">“Mark as Sent”</span>.
            </p>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                onClick={() => setConfirmItem(null)}
                className="px-4 py-2 border rounded-md text-xs sm:text-sm"
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  window.open(
                    `https://wa.me/?text=${buildWhatsAppMessage(confirmItem)}`,
                    "_blank",
                  )
                }
                className="px-4 py-2 bg-green-600 text-white rounded-md text-xs sm:text-sm"
              >
                Open WhatsApp
              </button>

              <button
                onClick={markWhatsAppSent}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-xs sm:text-sm"
              >
                Mark as Sent
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
