"use client";

import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

export type Option = {
  value: string;
  label: string;
};

interface RadixSelectProps {
  value?: string;
  onChange?: (v?: string) => void;
  placeholder?: string;
  options: Option[];
  disabled?: boolean;
}

export default function RadixSelect({
  value,
  onChange,
  placeholder = "Select",
  options,
  disabled = false,
}: RadixSelectProps) {
  return (
    <Select.Root value={value ?? undefined} onValueChange={onChange} disabled={disabled}>
      {/* Trigger */}
      <Select.Trigger
        type="button"
        className="
  w-full h-11 sm:h-12 px-3
  flex items-center justify-between
  rounded-xl border bg-white
  text-sm
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
          side="top" // ✅ FORCE UPWARD OPEN
          align="start"
          sideOffset={6}
          collisionPadding={8}
          className="
    z-[9999]
    w-[--radix-select-trigger-width]
    rounded-lg border bg-white shadow-xl
    max-h-[240px]
    flex flex-col
    overflow-hidden
  "
        >
          {/* Scroll Up */}
          <Select.ScrollUpButton className="flex justify-center py-1 bg-white">
            <ChevronUp className="w-4 h-4 text-gray-400" />
          </Select.ScrollUpButton>

          {/* Viewport fills remaining space */}
          <Select.Viewport className="flex-1 p-1 overflow-y-auto overscroll-contain">
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="
                  flex items-center justify-between
                  px-3 py-2 text-sm
                  rounded-md cursor-pointer
                  outline-none
                  hover:bg-blue-50
                  data-[state=checked]:bg-blue-50
                "
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check className="w-4 h-4 text-blue-600" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>

          {/* Scroll Down */}
          <Select.ScrollDownButton className="flex justify-center py-1 bg-white">
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
