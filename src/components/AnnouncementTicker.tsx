"use client";

type Announcement = {
  id: number;
  title: string;
  date: Date;
};

export default function AnnouncementTicker({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const getIcon = (title: string) => {
    const text = title.toLowerCase();

    if (text.includes("holiday") || text.includes("holi")) return "🎉";
    if (text.includes("exam") || text.includes("test")) return "📘";
    if (text.includes("meeting")) return "⚠️";
    if (text.includes("event")) return "📅";

    return "📢";
  };

  if (!announcements.length) return null;

  return (
    <div className="flex items-center gap-3 w-full overflow-hidden">
      {/* Label */}
      <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
        📢 Announcements
      </span>

      {/* Scrolling Area */}
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center gap-10 whitespace-nowrap animate-marquee text-sm text-gray-700">
          
          {[...announcements, ...announcements].map((a, i) => (
            <span key={i} className="flex items-center gap-2 font-medium">
              
              <span>{getIcon(a.title)}</span>

              <span>{a.title}</span>

              <span className="text-gray-400 text-xs">
                {new Date(a.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>

            </span>
          ))}

        </div>
      </div>
    </div>
  );
}