export const parseCSV = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return [];

  const parseLine = (line) => {
    const fields = [];
    let field = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(field.trim());
        field = '';
      } else {
        field += char;
      }
    }
    fields.push(field.trim());
    return fields;
  };

  const headers = parseLine(lines[0]).map(h => h.toLowerCase());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.length === 1 && !values[0]) continue;
    
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] !== undefined ? values[index] : '';
    });
    rows.push(row);
  }

  return rows;
};

export const buildCSV = (rows, headers = []) => {
  if (!Array.isArray(rows) || rows.length === 0) return headers.join(',') + '\n';
  
  const finalHeaders = headers.length > 0 ? headers : Object.keys(rows[0]);
  const csvLines = [finalHeaders.join(',')];

  for (const row of rows) {
    const rowValues = finalHeaders.map(header => {
      let val = row[header] !== undefined && row[header] !== null ? String(row[header]) : '';
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    });
    csvLines.push(rowValues.join(','));
  }

  return csvLines.join('\n');
};
