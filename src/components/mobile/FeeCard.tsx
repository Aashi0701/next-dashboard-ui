"use client";

import {
  FeeTypeChip,
  FeeStatusBadge,
} from "@/components/ui/FeeBadges";

export default function FeeCard({
  item,
  actions,
}: {
  item: {
    title: string;
    amount: number;
    className: string;
    type: string;
    isActive: boolean;
  };
  actions?: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded-lg px-3 py-2 shadow-sm">
      {/* ROW 1 */}
      <div className="flex justify-between items-start">
        <p className="font-medium text-sm truncate">{item.title}</p>

        <FeeStatusBadge active={item.isActive} />
      </div>

      {/* ROW 2 */}
      <div className="text-xs text-gray-500 mt-1">
        {item.className}
      </div>

      {/* ROW 3 */}
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">
            ₹{item.amount.toLocaleString()}
          </span>
          <FeeTypeChip type={item.type} />
        </div>

        {actions}
      </div>
    </div>
  );
}
