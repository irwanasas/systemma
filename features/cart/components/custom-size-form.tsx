"use client";

import { startTransition, useActionState, useState } from "react";
import { CircleNotch } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { addCustomItem } from "@/features/cart/server/actions";
import type { FormState } from "@/lib/errors";

type CustomSizeFormProps = {
  poBatchId: string;
  colors: { id: string; name: string }[];
  chestMaxCm: number;
  lengthMaxCm: number;
};

type Measurement = "chest" | "length";

const initialState: FormState = {};

const validate = (label: string, raw: string, max: number): string | null => {
  if (!raw) return `${label} wajib diisi.`;
  const value = Number(raw.replace(",", "."));
  if (!Number.isFinite(value)) return `${label} harus berupa angka.`;
  if (value <= 0) return `${label} harus lebih dari 0 cm.`;
  if (value > max) return `${label} maksimal ${max} cm.`;
  if (!Number.isInteger(Math.round(value * 1000) / 100)) return `${label} maksimal satu angka di belakang koma.`;
  return null;
};

export const CustomSizeForm = ({ poBatchId, colors, chestMaxCm, lengthMaxCm }: CustomSizeFormProps): React.ReactNode => {
  const [state, formAction, isPending] = useActionState(addCustomItem, initialState);
  const [values, setValues] = useState<Record<Measurement, string>>({ chest: "", length: "" });
  const [errors, setErrors] = useState<Record<Measurement, string | null>>({ chest: null, length: null });

  const rules: Record<Measurement, { label: string; max: number }> = {
    chest: { label: "Lingkar dada", max: chestMaxCm },
    length: { label: "Panjang badan", max: lengthMaxCm },
  };

  const check = (field: Measurement, value: string): string | null => {
    const error = validate(rules[field].label, value, rules[field].max);
    setErrors((current) => ({ ...current, [field]: error }));
    return error;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (isPending) return;
    const chestError = check("chest", values.chest);
    const lengthError = check("length", values.length);
    if (chestError || lengthError) return;
    const formData = new FormData(event.currentTarget);
    formData.set("chestCm", values.chest.replace(",", "."));
    formData.set("lengthCm", values.length.replace(",", "."));
    startTransition(() => formAction(formData));
  };

  const measurementField = (field: Measurement, name: string) => (
    <div>
      <label htmlFor={name}>
        {rules[field].label} (cm, maks. {rules[field].max})
      </label>
      <input
        id={name}
        name={name}
        inputMode="decimal"
        autoComplete="off"
        value={values[field]}
        aria-invalid={errors[field] ? true : undefined}
        aria-describedby={errors[field] ? `${name}-error` : undefined}
        onChange={(event) => {
          setValues((current) => ({ ...current, [field]: event.target.value }));
          if (errors[field]) check(field, event.target.value);
        }}
        onBlur={(event) => event.target.value && check(field, event.target.value)}
      />
      {errors[field] && (
        <p id={`${name}-error`} role="alert">
          {errors[field]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={isPending}>
      <input type="hidden" name="poBatchId" value={poBatchId} />
      <div>
        <label htmlFor="colorId">Warna</label>
        <select id="colorId" name="colorId" defaultValue="" required>
          <option value="" disabled>
            Pilih warna
          </option>
          {colors.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>
      {measurementField("chest", "chestCm")}
      {measurementField("length", "lengthCm")}
      <div>
        <label htmlFor="customQty">Jumlah (pcs)</label>
        <input id="customQty" name="qty" type="number" min={1} defaultValue={1} required />
      </div>
      {state.error && <p role="alert">{state.error}</p>}
      {state.message && <p role="status">{state.message}</p>}
      <Button type="submit" disabled={isPending} className="min-h-[var(--control-height)] px-4 font-semibold">
        {isPending && <CircleNotch aria-hidden="true" className="animate-spin" />}
        {isPending ? "Menambahkan…" : "Tambah ukuran custom"}
      </Button>
    </form>
  );
};
