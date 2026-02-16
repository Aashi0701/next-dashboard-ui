import Image from "next/image";
import CountChart from "./CountChart";
import prisma from "@/lib/prisma";

const CountChartContainer = async () => {
  const data = await prisma.student.groupBy({
    by: ["sex"],
    _count: true,
  });

  const boys = data.find((d) => d.sex === "MALE")?._count || 0;
  const girls = data.find((d) => d.sex === "FEMALE")?._count || 0;
  const total = boys + girls;

  return (
    <div
      className="
        bg-white rounded-2xl
        w-full h-full
        px-4 py-4
        shadow-sm border border-slate-100
      "
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-sm font-semibold text-gray-800 tracking-wide">
          Students
        </h1>
        <Image src="/moreDark.png" alt="" width={18} height={18} />
      </div>

      {/* CHART */}
      <CountChart boys={boys} girls={girls} />

      {/* LEGEND */}
      <div className="flex justify-center gap-10 mt-3">
        {/* BOYS */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2 rounded-full bg-purple-300" />
          <span className="text-sm font-semibold text-gray-700">
            {boys}
          </span>
          <span className="text-xs text-gray-400">
            Boys ({total ? Math.round((boys / total) * 100) : 0}%)
          </span>
        </div>

        {/* GIRLS */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2 rounded-full bg-rose-300" />
          <span className="text-sm font-semibold text-gray-700">
            {girls}
          </span>
          <span className="text-xs text-gray-400">
            Girls ({total ? Math.round((girls / total) * 100) : 0}%)
          </span>
        </div>
      </div>
    </div>
  );
};

export default CountChartContainer;
