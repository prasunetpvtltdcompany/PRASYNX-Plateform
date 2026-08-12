/**
 * Client-side CSV export for table data. Emits a UTF-8 file (with BOM so Excel
 * renders Hindi/Devanagari correctly) via a temporary download link.
 */
export function exportCsv(filename: string, headers: string[], rows: (string | number | null | undefined)[][]): void {
  const escape = (value: string | number | null | undefined): string => {
    const s = value === null || value === undefined ? "" : String(value);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\r\n");
  const blob = new Blob([`\ufeff${lines}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}