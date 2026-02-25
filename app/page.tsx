"use client";

import Link from "next/link";
import { VALID_SESSIONS, SESSION_LABELS } from "@/lib/types";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          TikTok Case Discussion
        </h1>
        <p className="text-gray-500 mb-6">Select your section to join</p>
        <div className="space-y-3">
          {VALID_SESSIONS.map((sid) => (
            <Link
              key={sid}
              href={`/${sid}`}
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
