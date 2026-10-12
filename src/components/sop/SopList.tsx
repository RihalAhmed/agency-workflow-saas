"use client";

import { Sop } from "./useSops";
import { useState } from "react";
import { SopTitleRow } from "./SopTitleRow";

interface SopListProps {
  sops: Sop[];
  onActivate: (id: string) => Promise<void>;
  onRename: (id: string, newTitle: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  selectedSopId?: string | null;
  onSelect?: (id: string) => void;
}

export function SopList({ sops, onActivate, onRename, onDelete, selectedSopId, onSelect }: SopListProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (sops.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 mt-8 w-full pb-8">
      {sops.map((sop) => (
        <div 
          key={sop.id}
          onClick={() => {
            onSelect?.(sop.id);
            if (!sop.is_active) {
              onActivate(sop.id);
            }
          }}
          className={`cursor-pointer transition-colors border-2 rounded-xl ${
            selectedSopId === sop.id ? 'border-blue-500 bg-blue-500/5' : 'border-transparent hover:bg-white/5'
          }`}
        >
          <SopTitleRow 
            sop={sop}
            onActivate={onActivate}
            onRename={onRename}
            onDelete={onDelete}
            processingId={processingId}
            setProcessingId={setProcessingId}
          />
        </div>
      ))}
    </div>
  );
}
