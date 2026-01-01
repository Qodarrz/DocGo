"use client";

import React from "react";

export default function Header() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, Dr. Anderson
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Here's what's happening with your practice today
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Last updated: Today, 10:45 AM
        </div>
      </div>
    </div>
  );
}