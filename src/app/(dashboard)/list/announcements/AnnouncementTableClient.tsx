"use client";

import { useState } from "react";
import Table from "@/components/Table";
import { FiSend } from "react-icons/fi";
import AnnouncementCard from "@/components/mobile/AnnouncementCard";

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
        `Date: ${new Date(item.date).toLocaleDateString("en-IN")}`
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
            className: "text-center w-[170px]",
          },
          {
            header: "Actions",
            accessor: "actions",
            className: "text-center w-[140px]",
          },
        ]
      : []),
  ];

  const formatSentAt = (date: string) =>
    new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const renderRow = (item: any) => {
    const isUnread = item.reads.length === 0;
    const isLatest =
      isUnread &&
      Date.now() - new Date(item.date).getTime() < 48 * 60 * 60 * 1000;

    const isSent = item.whatsappSent;

    return (
      <tr key={item.id} className="border-b hover:bg-gray-50">
        {/* TITLE */}
        <td className="p-4 align-middle">
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
        <td className="p-4 align-middle">
          {item.class?.name || "All Classes"}
        </td>

        {/* DATE */}
        <td className="p-4 align-middle hidden md:table-cell text-gray-500">
          {new Date(item.date).toLocaleDateString("en-IN")}
        </td>

        {/* LAST SENT */}
        {role === "admin" && (
          <td className="p-4 align-middle text-center">
            {isSent ? (
              <div className="text-[11px] text-gray-600">
                {formatSentAt(item.whatsappSentAt)}
              </div>
            ) : (
              <span className="text-gray-400 text-sm">—</span>
            )}
          </td>
        )}

        {/* ACTIONS */}
        {role === "admin" && (
          <td className="p-4 align-middle text-center">
            <div className="flex items-center justify-center gap-3">
              {!isSent && (
                <button
                  onClick={() => setConfirmItem(item)}
                  className="w-9 h-9 flex items-center justify-center rounded-full
                  bg-green-50 border border-green-200 hover:bg-green-100"
                >
                  <FiSend className="w-4 h-4 text-green-600" />
                </button>
              )}
              {item.actions}
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
            onSend={(i)  => setConfirmItem(i)}
            onRead={markAsRead}
          />
        ))}
      </div>

      {/* EMPTY */}
      {data.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-6">
          No announcements found
        </p>
      )}

      {/* CONFIRM MODAL */}
      {confirmItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[380px] shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Send Announcement?</h2>

            <p className="text-sm text-gray-600 mb-4">
              WhatsApp will open. After sending, click{" "}
              <b>“Mark as Sent”</b>.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmItem(null)}
                className="px-4 py-2 rounded-md border text-sm"
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  window.open(
                    `https://wa.me/?text=${buildWhatsAppMessage(confirmItem)}`,
                    "_blank"
                  )
                }
                className="px-4 py-2 rounded-md bg-green-600 text-white text-sm"
              >
                Open WhatsApp
              </button>

              <button
                onClick={markWhatsAppSent}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm"
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
