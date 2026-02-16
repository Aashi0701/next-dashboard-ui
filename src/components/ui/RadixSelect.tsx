"use client";

import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

export type Option = {
  value: string;
  label: string;
};

export interface RadixSelectProps {
  value?: string;
  onChange?: (v?: string) => void;
  placeholder?: string;
  options: Option[];
  disabled?: boolean;
}

export default function RadixSelect({
  value,
  onChange,
  placeholder = "Sex", // ⭐ default placeholder
  options,
  disabled = false,
}: RadixSelectProps) {
  return (
    <Select.Root
      value={value}
      onValueChange={(v) => onChange?.(v)}
      disabled={disabled}
    >
      <Select.Trigger
        type="button"
        className="
    w-full h-9 sm:h-12 text-xs sm:text-sm px-3
    flex items-center justify-between
    rounded-xl border bg-white
    outline-none transition
    focus:border-blue-600 focus:ring-2 focus:ring-blue-100
  "
      >
        <Select.Value
          placeholder={<span className="text-gray-400">{placeholder}</span>}
        />

        <ChevronDown className="w-4 h-4 text-gray-500" />
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          side="bottom"
          align="start"
          sideOffset={6}
          collisionPadding={10}
          className="z-[9999] max-h-60 overflow-y-auto rounded-xl border bg-white shadow-xl"
        >
          <Select.Viewport className="p-1">
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="
                  px-3 py-2 text-sm
                  rounded-md cursor-pointer
                  hover:bg-blue-50
                  flex justify-between
                "
              >
                <Select.ItemText>{opt.label}</Select.ItemText>

                <Select.ItemIndicator>
                  <Check className="w-4 h-4 text-blue-600" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
