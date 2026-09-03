import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Home,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 md:px-12 md:py-10 flex items-center justify-center bg-slate-50/40">
      <div className="w-full max-w-xl rounded-2xl p-6 sm:p-10 text-center opacity-0 animate-fade-in-scale ">
        {/* Icon */}
        <div className="mx-auto h-20 w-20 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
          <AlertTriangle size={34} strokeWidth={1.6} className="text-orange-500"/>
        </div>

        {/* 404 */}
        <div className="mt-6 text-6xl sm:text-7xl font-black tracking-tight text-slate-800">
          404
        </div>

        {/* Title */}
        <h1 className="mt-2 text-xl sm:text-2xl font-bold text-slate-900">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="mt-2 mx-auto max-w-md text-sm sm:text-base leading-6 text-slate-500">
          Sorry, we couldn't find the page you're looking for. It may have been moved, deleted, or the address might be incorrect.
        </p>

        {/* Small information box */}
        <div className=" mt-6 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 flex items-center justify-center gap-2 text-xs text-slate-400 ">
          <Search size={15} className="text-slate-400" />

          <span>
            Check the URL or return to a safe page.
          </span>
        </div>

        {/* Actions */}
        <div
          className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)} className="w-full sm:w-auto border-slate-200 text-slate-600 hover:bg-slate-50 ">
            <ArrowLeft size={17} />
            Go Back
          </Button>

          <Button
            onClick={() => navigate("/user/home")}
            className=" w-full sm:w-auto bg-orange-500 hover:bg-orange-600 shadow-sm transition-all active:scale-[0.98]">
            <Home size={17} />
            Go to Dashboard
          </Button>
        </div>

        {/* Footer */}
        <p className="mt-7 text-[11px] text-slate-400">
          Error code: 404 · Page unavailable
        </p>
      </div>
    </div>
  );
}
