import FormContainer from "@/components/FormContainer";

type ResultsCardProps = {
  item: {
    id: number;
    title: string;
    studentName: string;
    studentSurname: string;
    teacherName: string;
    teacherSurname: string;
    score: number;
    className: string;
    startTime: Date;
  };
  role?: string;
};

export default function ResultsCard({ item, role }: ResultsCardProps) {
  return (
    <div className="bg-white border rounded-xl p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="text-sm font-semibold truncate">
            {item.title}
          </h3>

          <p className="text-xs text-gray-500 truncate">
            {item.studentName} {item.studentSurname}
          </p>

          <p className="text-xs text-gray-500 truncate">
            {item.teacherName} {item.teacherSurname}
          </p>

          <p className="text-xs text-gray-400">
            {item.className} •{" "}
            {new Intl.DateTimeFormat("en-US").format(item.startTime)}
          </p>
        </div>

        {/* SCORE */}
        <div className="flex flex-col items-end gap-2">
          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
            {item.score}
          </span>

          {(role === "admin" || role === "teacher") && (
            <div className="flex gap-1">
              <FormContainer table="result" type="update" data={item} />
              <FormContainer table="result" type="delete" id={item.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
