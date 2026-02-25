"use client";

import Link from "next/link";
import { VALID_SESSIONS, SESSION_LABELS } from "@/lib/types";

export default function BoardPickerPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-md border border-gray-700">
        <h1 className="text-2xl font-bold mb-2">TikTok Case Discussion</h1>
        <p className="text-gray-400 mb-6">Select a section to view the board</p>
        <div className="space-y-3">
          {VALID_SESSIONS.map((sid) => (
            <Link
              key={sid}
              href={`/board/${sid}`}
              className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {SESSION_LABELS[sid] || `Section ${sid}`}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
