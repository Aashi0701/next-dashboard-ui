"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Calendar, { CalendarProps } from "react-calendar";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const EventCalendar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [value, setValue] = useState<Date | null>(null);

  // Initialize on client only
  useEffect(() => {
    const urlDate = searchParams.get("date");
    setValue(urlDate ? new Date(urlDate) : new Date());
  }, []);

  // Update URL when a date changes
  useEffect(() => {
    if (!value) return;

    const formatted = value.toISOString().split("T")[0];
    const current = searchParams.get("date");

    if (current !== formatted) {
      router.push(`?date=${formatted}`);
    }
  }, [value]);

  // Correct handler for React Calendar
  const handleChange = (val: Value) => {
    if (Array.isArray(val)) {
      setValue(val[0] ?? null); // pick first date if range
    } else {
      setValue(val);
    }
  };

  // Prevent SSR mismatch
  if (!value) return null;

  return <Calendar value={value} onChange={handleChange} />;
};

export default EventCalendar;
