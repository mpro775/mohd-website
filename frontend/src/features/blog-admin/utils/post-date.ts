export function datetimeLocalToUtc(value: string): string {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) throw new Error("وقت الجدولة غير صالح");
  return date.toISOString();
}

export function utcToDatetimeLocal(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
