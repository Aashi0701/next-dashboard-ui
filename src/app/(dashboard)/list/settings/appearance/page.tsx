"use client";

import { Moon, Sun, Laptop, Check } from "lucide-react";
import { useState } from "react";

export default function AppearanceSettings() {
  const [theme, setTheme] = useState("system");

  const themes = [
    { key: "light", label: "Light", icon: Sun },
    { key: "dark", label: "Dark", icon: Moon },
    { key: "system", label: "System", icon: Laptop },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h2 className="text-lg font-semibold">Appearance</h2>
        <p className="text-sm text-gray-500">
          Customize the interface
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {themes.map(({ key, label, icon: Icon }) => {
          const active = theme === key;

          return (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={`relative flex items-center gap-3 p-4 rounded-xl border
                ${
                  active
                    ? "border-blue-600 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>

              {active && (
                <span className="absolute top-3 right-3 bg-blue-600 rounded-full p-1">
                  <Check className="w-3 h-3 text-white" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
