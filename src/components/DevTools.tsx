"use client";

import { useState } from "react";

const IS_DEV = process.env.NODE_ENV === "development";

export default function DevTools() {
  const [open, setOpen] = useState(false);

  if (!IS_DEV) return null;

  return (
    <div className="fixed top-2 right-2 z-[9999]">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-red-500 text-white text-xs font-bold shadow-lg opacity-50 hover:opacity-100 transition-opacity"
      >
        D
      </button>
      {open && (
        <div className="absolute top-10 right-0 bg-white border border-gray-200 rounded-xl shadow-xl p-3 space-y-2 min-w-[160px]">
          <p className="text-xs font-bold text-gray-500">Dev Tools</p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
            className="w-full text-left text-sm px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium"
          >
            초기화 (온보딩)
          </button>
          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="w-full text-left text-sm px-3 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 font-medium"
          >
            홈으로
          </button>
          <button
            onClick={() => {
              console.log(JSON.parse(localStorage.getItem("userProfile") || "{}"));
              alert("콘솔에 프로필 출력됨");
            }}
            className="w-full text-left text-sm px-3 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 font-medium"
          >
            프로필 확인
          </button>
        </div>
      )}
    </div>
  );
}
