export default function SubmissionAnalytics({ data }: any) {
  return (
    <div className="flex flex-col gap-4">
      {data.map((item: any, i: number) => {
        const percent =
          item.total === 0
            ? 0
            : Math.round((item.submitted / item.total) * 100);

        const getColor = () => {
          if (percent >= 80) return "bg-green-500";
          if (percent >= 50) return "bg-yellow-500";
          return "bg-red-500";
        };

        return (
          <div key={i} className="flex flex-col gap-1">
            {/* 🔹 HEADER */}
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">
                {item.className}
              </span>

              <span className="text-xs text-gray-500">
                {item.submitted}/{item.total} • {percent}%
              </span>
            </div>

            {/* 🔹 BAR */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`${getColor()} h-2 rounded-full transition-all duration-700`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}

      {/* 🔥 SMART INSIGHT */}
      <Insights data={data} />
    </div>
  );
}

// ================= 🔥 INSIGHTS COMPONENT =================

function Insights({ data }: any) {
  if (!data || data.length === 0) {
    return <p className="text-xs text-gray-400">No assignments available</p>;
  }

  const validClasses = data.filter((c: any) => c.total > 0);

  // 🔥 NO ASSIGNMENTS CASE
  if (validClasses.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
        <span className="text-lg">📄</span>
        <span>
          No assignments yet. Create assignments to start tracking submissions.
        </span>
      </div>
    );
  }

  const lowClasses = validClasses.filter((c: any) => c.percent < 50);

  if (lowClasses.length > 0) {
    return (
      <p className="text-xs text-red-500">
        ⚠ {lowClasses.length} class(es) have low submissions
      </p>
    );
  }

  return (
    <p className="text-xs text-green-600">✔ Submission progress looks good</p>
  );
}
