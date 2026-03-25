export default function SmartAlerts({ insights }: any) {
  const getStyle = (type: string) => {
    switch (type) {
      case "critical":
        return "bg-red-50 text-red-600 border-red-200";
      case "warning":
        return "bg-yellow-50 text-yellow-600 border-yellow-200";
      default:
        return "bg-green-50 text-green-600 border-green-200";
    }
  };

  return (
    <div className="bg-white border rounded-2xl shadow-sm p-4">
      <h2 className="text-sm font-semibold mb-3">
        Smart Alerts
      </h2>

      <div className="flex flex-col gap-2">
        {insights.map((alert: any, i: number) => (
          <div
            key={i}
            className={`px-3 py-2 rounded-lg border flex justify-between ${getStyle(
              alert.type
            )}`}
          >
            <span className="text-xs font-medium">
              {alert.message}
            </span>

            {alert.value && (
              <span className="text-xs font-semibold">
                {alert.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}