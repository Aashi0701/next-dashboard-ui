export default function SubmissionProgress({
  submitted,
  total,
}: any) {
  const percent =
    total === 0 ? 0 : Math.round((submitted / total) * 100);

  return (
    <div className="flex flex-col gap-3">
      {/* 🔹 HEADER */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Submissions
        </span>

        {/* 🔥 RIGHT SIDE (NO OVERLAP) */}
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span>
            {submitted}/{total}
          </span>
          <span className="text-gray-400 text-xs">
            {percent}%
          </span>
        </div>
      </div>

      {/* 🔹 PROGRESS BAR */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-purple-600 h-2 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* 🔹 EMPTY STATE */}
      {total === 0 && (
        <div className="text-xs text-gray-400">
          No assignments available
        </div>
      )}
    </div>
  );
}