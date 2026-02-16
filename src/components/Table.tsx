import React from "react";

type Column = {
  header: string;
  accessor: string;
  className?: string;
};

const widthMap: Record<string, string> = {
  info: "w-[26%]",
  action: "w-[10%]",
  phone: "w-[14%]",
  address: "w-[16%]",

  students: "w-[20%]",
  studentId: "w-[14%]",
  grade: "w-[8%]",
  fees: "w-[14%]",

  subjects: "w-[18%]",
  classes: "w-[18%]",

  subject: "w-[20%]",
  class: "w-[16%]",
  teacher: "w-[22%]",
  date: "w-[14%]",
  dueDate: "w-[14%]",

  title: "w-[26%]",
  startTime: "w-[14%]",
  endTime: "w-[14%]",

  student: "w-[20%]",
  lesson: "w-[18%]",
  status: "w-[14%]",
};

interface TableProps {
  columns: Column[];
  data: any[];
  renderRow: (item: any, index: number) => React.ReactNode; // ✅ FIXED
}

const Table = ({ columns, renderRow, data }: TableProps) => {
  return (
    <table className="w-full mt-4 border-collapse table-fixed">
      {/* Column widths */}
      <colgroup>
        {columns.map((col) => (
          <col
            key={col.accessor}
            className={widthMap[col.accessor] || "w-auto"}
          />
        ))}
      </colgroup>

      <thead>
        <tr className="text-left text-gray-500 text-sm border-b">
          {columns.map((col) => (
            <th
              key={col.accessor}
              className={`p-4 font-medium text-left text-gray-500 text-sm
              whitespace-nowrap truncate overflow-hidden
              ${col.className || ""}`}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody className="text-sm">
        {data.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className="p-4 text-center text-gray-500"
            >
              No records found
            </td>
          </tr>
        ) : (
          data.map((item, index) => renderRow(item, index)) // ✅ FIXED
        )}
      </tbody>
    </table>
  );
};

export default Table;
