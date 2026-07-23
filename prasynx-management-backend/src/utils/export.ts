import { Response } from 'express';

export function sendCSV(res: Response, filename: string, rows: Record<string, any>[], columns: { key: string; label: string }[]) {
  const headers = columns.map(c => c.label);
  const csvRows = [
    headers.join(','),
    ...rows.map(row =>
      columns.map(c => {
        const val = row[c.key];
        if (val == null) return '';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(',')
    ),
  ];
  const csv = csvRows.join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
  res.send(csv);
}

export function sendJSONExport(res: Response, filename: string, data: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
  res.json(data);
}
