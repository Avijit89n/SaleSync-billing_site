import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  Clock,
  Wrench
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Reports() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-6 sm:px-6 md:px-12 md:py-10 flex items-center justify-center bg-slate-50/40">
      <div className="w-full max-w-xl rounded-2xl p-6 sm:p-10 text-center opacity-0 animate-fade-in-scale">
        {/* Icon */}
        <div className="mx-auto h-20 w-20 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
          <Wrench size={34} strokeWidth={1.6} className="text-orange-500" />
        </div>

        {/* Large Text / Badge */}
        <div className="mt-6 text-4xl sm:text-5xl font-black tracking-tight text-slate-800">
          Coming Soon
        </div>

        {/* Title */}
        <h1 className="mt-4 text-xl sm:text-2xl font-bold text-slate-900">
          Page Under Construction
        </h1>

        {/* Description */}
        <p className="mt-2 mx-auto max-w-md text-sm sm:text-base leading-6 text-slate-500">
          We're currently working hard behind the scenes to build this feature. It's not quite ready yet, but please check back soon!
        </p>

        {/* Small information box */}
        <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Clock size={15} className="text-slate-400" />
          <span>
            Our developers are actively working on this page.
          </span>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2">
          {/* <Button variant="outline" onClick={() => navigate(-1)} className="w-full sm:w-auto border-slate-200 text-slate-600 hover:bg-slate-50">
            <ArrowLeft size={17} />
            Go Back
          </Button> */}

          <Button
            onClick={() => navigate("/user")}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 shadow-sm transition-all active:scale-[0.98]"
          >
            <Home size={17} />
            Go to Dashboard
          </Button>
        </div>

        {/* Footer */}
        <p className="mt-7 text-[11px] text-slate-400">
          Status: Work in progress · Coming soon
        </p>
      </div>
    </div>
  );
}