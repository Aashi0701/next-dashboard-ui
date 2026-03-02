"use client";

import * as Popover from "@radix-ui/react-popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

type Props = {
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
};

export default function RadixDateTimePicker({
  value,
  onChange,
  placeholder = "Select date & time",
}: Props) {
  const [open, setOpen] = useState(false);
  const date = value;

  const updateTime = (type: "hour" | "minute", val: number) => {
    if (!date) return;
    const next = new Date(date);
    if (type === "hour") next.setHours(val);
    if (type === "minute") next.setMinutes(val);
    onChange(next);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen} modal={false}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="
            w-full h-10
            flex items-center justify-between
            rounded-xl border bg-white px-3
            text-sm text-gray-700
            hover:bg-gray-50
          "
        >
          <span>
            {date ? (
              date.toLocaleString()
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </span>
          <CalendarIcon size={16} className="text-gray-500" />
        </button>
      </Popover.Trigger>

      {/* ✅ THIS IS THE FIX */}
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={8}
          avoidCollisions
          collisionPadding={16}
          className="
            z-[99999]
            rounded-xl
            border
            bg-white
            p-3
            shadow-xl
          "
        >
          {/* DATE */}
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => d && onChange(d)}
          />

          {/* TIME */}
          <div className="flex gap-2 mt-3">
            <input
              type="number"
              min={0}
              max={23}
              value={date?.getHours() ?? ""}
              onChange={(e) => updateTime("hour", Number(e.target.value))}
              placeholder="HH"
              className="w-16 h-9 rounded-md border px-2 text-sm"
            />

            <span className="pt-2">:</span>

            <input
              type="number"
              min={0}
              max={59}
              value={date?.getMinutes() ?? ""}
              onChange={(e) => updateTime("minute", Number(e.target.value))}
              placeholder="MM"
              className="w-16 h-9 rounded-md border px-2 text-sm"
            />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}