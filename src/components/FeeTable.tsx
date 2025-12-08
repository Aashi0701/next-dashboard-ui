"use client";

import FormModal from "@/components/FormModal";

export default function FeeTable({ fees }: { fees: any[] }) {
  return (
    <div className="bg-white rounded-md shadow overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b bg-gray-50">
          <tr>
            <th className="p-3 text-left">Title</th>
            <th className="p-3">Amount</th>
            <th className="p-3">Class</th>
            <th className="p-3">Type</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {fees.map((fee) => (
            <tr key={fee.id} className="border-b">
              <td className="p-3">{fee.title}</td>
              <td className="p-3 font-medium">₹{fee.amount}</td>
              <td className="p-3">{fee.class?.name ?? "-"}</td>
              <td className="p-3">{fee.type}</td>
              <td className="p-3 flex justify-center gap-2">
                <FormModal type="update" table="fee" data={fee} />
                <FormModal type="delete" table="fee" id={fee.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
