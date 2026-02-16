import FormContainer from "@/components/FormContainer";

export default function EventCard({
  item,
  role,
}: {
  item: any;
  role?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        {/* LEFT CONTENT */}
        <div className="min-w-0">
          {/* Title */}
          <p className="text-sm font-semibold text-gray-900 truncate">
            {item.title}
          </p>

          {/* Class + Date */}
          <p className="mt-0.5 text-[12px] text-gray-500 truncate">
            {item.class?.name ?? "All Classes"} ·{" "}
            {new Intl.DateTimeFormat("en-US").format(item.startTime)}
          </p>

          {/* Time */}
          <p className="mt-0.5 text-[12px] text-gray-500 truncate">
            {item.startTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}{" "}
            –{" "}
            {item.endTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </p>
        </div>

        {/* ACTIONS */}
        {role === "admin" && (
          <div className="flex gap-1 shrink-0 pt-0.5">
            <FormContainer table="event" type="update" data={item} />
            <FormContainer table="event" type="delete" id={item.id} />
          </div>
        )}
      </div>
    </div>
  );
}
