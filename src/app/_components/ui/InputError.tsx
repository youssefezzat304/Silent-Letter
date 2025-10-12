import React from "react";
import type { FieldError, FieldValues, Path, UseFormReturn } from "react-hook-form";

type Props<TForm extends FieldValues> = {
  form: UseFormReturn<TForm>;
  name: Path<TForm>;
};

export default function InputError<TForm extends FieldValues>({
  form,
  name,
}: Props<TForm>) {
  const fieldError = (form.formState.errors as Record<string, any>)[name] as
    | FieldError
    | undefined;

  return (
    <span className="h-4 text-xs text-red-400">
      {fieldError?.message ?? ""}
    </span>
  );
}
