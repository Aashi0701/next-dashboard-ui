"use client";

import * as React from "react";
import dayjs from "dayjs";
import * as Popover from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

const MIN_AGE = 18;

interface Props {
  value?: Date;
  onChange?: (v?: Date) => void;
  placeholder?: string;
}

export default function RadixDatePicker({
  value,
  onChange,
  placeholder = "Select date",
}: Props) {
  const [open, setOpen] = React.useState(false);

  const today = new Date();
  const minDate = new Date(today.getFullYear() - 80, 0, 1);
  const latestAllowed = new Date(
    today.getFullYear() - MIN_AGE,
    today.getMonth(),
    today.getDate()
  );

  return (
    <Popover.Root open={open} onOpenChange={setOpen} modal={false}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="
            w-full h-9 sm:h-12 px-3
            flex items-center justify-between
            rounded-xl border bg-white
            text-xs sm:text-sm
            focus:border-blue-600 focus:ring-2 focus:ring-blue-100
          "
        >
          <span className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 opacity-60" />
            {value ? (
              <span>{dayjs(value).format("DD MMM YYYY")}</span>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </span>
        </button>
      </Popover.Trigger>

      {/* ✅ PORTAL — OUTSIDE FORM */}
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="center"
          sideOffset={8}
          collisionPadding={16}
          className="z-[99999] w-[300px] p-0 rounded-3xl overflow-hidden border bg-white shadow-2xl"
        >
          <Calendar
            mode="single"
            selected={value}
            defaultMonth={value}
            captionLayout="dropdown"
            fromDate={minDate}
            toDate={latestAllowed}
            onSelect={(date) => {
              onChange?.(date);
              setOpen(false);
            }}
            className="p-3"
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
