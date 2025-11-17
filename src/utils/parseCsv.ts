export function parseCsvText(text: string): string[] {
  if (!text) return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const first = lines[0].toLowerCase();
  const dataLines = (first.includes('raw') || first.includes('description') || first.includes('transaction'))
    ? lines.slice(1)
    : lines;
  return dataLines.map(line => {
    const parts = line.split(',');
    const candidate = parts.length === 1 ? parts[0] : parts.reduce((a,b) => a.length > b.length ? a : b);
    return candidate.replace(/^"|"$/g, '').trim();
  }).filter(Boolean);
}
