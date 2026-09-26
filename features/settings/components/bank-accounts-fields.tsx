"use client";

import { useState } from "react";
import { Plus, Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BankAccount = { bank: string; number: string; holder: string };

type BankAccountsFieldsProps = {
  accounts: BankAccount[];
  maxRows: number;
};

const emptyAccount: BankAccount = { bank: "", number: "", holder: "" };

export const BankAccountsFields = ({ accounts, maxRows }: BankAccountsFieldsProps): React.ReactNode => {
  const [rows, setRows] = useState<BankAccount[]>(() =>
    Array.from({ length: maxRows }, (_, index) => accounts[index] ?? emptyAccount),
  );
  const [visibleCount, setVisibleCount] = useState(() => Math.max(1, Math.min(accounts.length, maxRows)));

  const update = (index: number, field: keyof BankAccount, value: string): void =>
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));

  const remove = (index: number): void => {
    setRows((current) => [...current.filter((_, rowIndex) => rowIndex !== index), emptyAccount]);
    setVisibleCount((count) => Math.max(1, count - 1));
  };

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {rows.map((row, index) => (
          <li key={index} className={cn("flex-col gap-3 p-3 sm:flex-row sm:items-end", index >= visibleCount ? "hidden" : "flex")}>
            <div className="grid flex-auto gap-3 sm:grid-cols-[10rem_minmax(0,1fr)_minmax(0,1.3fr)]">
              <div>
                <label htmlFor={`bank${index}`}>Nama bank</label>
                <input
                  id={`bank${index}`}
                  name={`bank${index}`}
                  value={row.bank}
                  onChange={(event) => update(index, "bank", event.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`number${index}`}>Nomor rekening</label>
                <input
                  id={`number${index}`}
                  name={`number${index}`}
                  inputMode="numeric"
                  value={row.number}
                  onChange={(event) => update(index, "number", event.target.value)}
                  className="tabular-nums"
                />
              </div>
              <div>
                <label htmlFor={`holder${index}`}>Atas nama</label>
                <input
                  id={`holder${index}`}
                  name={`holder${index}`}
                  value={row.holder}
                  onChange={(event) => update(index, "holder", event.target.value)}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Hapus rekening ${index + 1}`}
              onClick={() => remove(index)}
              className="size-[var(--control-height)] self-end text-muted-foreground hover:text-danger"
            >
              <Trash aria-hidden="true" className="size-5" />
            </Button>
          </li>
        ))}
      </ul>
      {visibleCount < maxRows && (
        <Button
          type="button"
          variant="outline"
          className="min-h-9 self-start text-ui"
          onClick={() => setVisibleCount((count) => count + 1)}
        >
          <Plus aria-hidden="true" />
          Tambah rekening
        </Button>
      )}
      <p className="text-sm text-muted-foreground">
        Maksimal {maxRows} rekening. Perubahan tersimpan setelah menekan Simpan rekening.
      </p>
    </div>
  );
};
