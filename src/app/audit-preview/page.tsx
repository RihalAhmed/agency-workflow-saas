import React from "react";
import { AuditBlueprint } from "@/components/audit/loading/AuditBlueprint";
import { AuditHeader } from "@/components/audit/AuditHeader";

export default function AuditPreview() {
  return (
    <div className="h-screen w-full bg-slate-100 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-[1600px] h-full flex flex-col bg-gradient-to-br from-[#000000] via-[#533afd] to-[#000000] rounded-[25px] overflow-hidden shadow-2xl">
        <AuditHeader activeTab="SEO Audit" companyName="Preview Audit" />
        <AuditBlueprint domain="preview-domain.com" />
      </div>
    </div>
  );
}
