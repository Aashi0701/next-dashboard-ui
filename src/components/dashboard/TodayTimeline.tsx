"use client";

import { useState } from "react";

type Lesson = {
  id: number;
  classId: number;
  day: string;
  class: {
    name: string;
  };
  startTime?: string | Date;
};

export default function TodayTimeline({ lessons }: { lessons: Lesson[] }) {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const markAttendance = async (lessonId: number) => {
    try {
      setLoadingId(lessonId);

      await fetch("/api/attendance/mark", {
        method: "POST",
        body: JSON.stringify({ lessonId }),
      });

      // 🔁 refresh UI (simple real-time)
      window.location.reload();
    } catch (error) {
      console.error("Attendance failed");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
      <div className="flex justify-between mb-5">
        <h2 className="text-lg font-semibold">Today's Timeline</h2>
        <span className="text-xs text-gray-400">
          {lessons.length} sessions
        </span>
      </div>

      {lessons.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          🎉 No sessions today
        </div>
      ) : (
        <div className="relative pl-8">
          <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-purple-100"></div>

          {lessons.map((lesson, index) => {
            const formattedTime = lesson.startTime
              ? new Date(lesson.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null;

            return (
              <div key={lesson.id} className="relative mb-6">
                {/* DOT */}
                <div className="absolute left-0 top-2 w-6 h-6 flex items-center justify-center">
                  <div className="w-3 h-3 bg-purple-600 rounded-full ring-4 ring-purple-100"></div>
                </div>

                {/* CARD */}
                <div className="ml-4 p-4 bg-white border rounded-xl shadow-sm hover:shadow-md flex justify-between items-center">
                  {/* LEFT */}
                  <div>
                    <p className="font-medium">{lesson.class.name}</p>
                    <p className="text-xs text-gray-400">
                      Session {index + 1}
                    </p>
                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {formattedTime || "Scheduled"}
                    </span>

                    <button
                      onClick={() => markAttendance(lesson.id)}
                      disabled={loadingId === lesson.id}
                      className="text-xs bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700"
                    >
                      {loadingId === lesson.id
                        ? "Marking..."
                        : "Mark"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}