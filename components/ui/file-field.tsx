"use client";

import { useState } from "react";
import { FileArrowUp } from "@phosphor-icons/react";

type FileFieldProps = {
  id: string;
  name: string;
  label: string;
  accept: string;
  required?: boolean;
};

export const FileField = ({ id, name, label, accept, required }: FileFieldProps): React.ReactNode => {
  const [fileName, setFileName] = useState<string | null>(null);
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <label className="!m-0 flex min-h-14 max-w-lg cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border-strong bg-surface px-3 py-2 !font-normal transition-colors duration-150 focus-within:ring-[3px] focus-within:ring-ring/50 hover:bg-muted">
        <FileArrowUp aria-hidden="true" className="size-6 shrink-0 text-primary-strong" />
        <span className="flex min-w-0 flex-col">
          <span className="text-ui font-semibold">{fileName ? "Ganti file" : "Pilih file"}</span>
          <span className="truncate text-sm text-muted-foreground">{fileName ?? "Belum ada file dipilih"}</span>
        </span>
        <input
          id={id}
          name={name}
          type="file"
          accept={accept}
          required={required}
          className="sr-only"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
        />
      </label>
    </div>
  );
};
