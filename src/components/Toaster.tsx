"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import { useStore } from "@/lib/store";

export default function Toaster() {
  const { toasts } = useStore();
  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === "success" ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}