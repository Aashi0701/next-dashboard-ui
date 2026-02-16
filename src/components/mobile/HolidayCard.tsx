import FormContainer from "@/components/FormContainer";

export default function HolidayCard({
  item,
}: {
  item: {
    id: number;
    title: string;
    date: Date;
    isFullDay: boolean;
  };
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        {/* LEFT */}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {item.title}
          </p>

          <p className="mt-0.5 text-[12px] text-gray-500 truncate">
            {new Date(item.date).toLocaleDateString("en-IN")}
            {" · "}
            {item.isFullDay ? "Full Day" : "Half Day"}
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-1 shrink-0">
          <FormContainer table="holiday" type="update" data={item} />
          <FormContainer table="holiday" type="delete" id={item.id} />
        </div>
      </div>
    </div>
  );
}
