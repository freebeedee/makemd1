
export const sanitizeSQLStatement = (name: string) => {
  if (!name) return '';
  
  // Remove null bytes
  let sanitized = name.replace(/\0/g, '');
  
  // Escape single quotes
  sanitized = sanitized.replace(/'/g, `''`);
  
  // Block common SQL injection patterns
  const dangerousPatterns = [
    /--/g,                    // SQL comments
    /;\s*(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE|TRUNCATE)/gi,
    /UNION\s+SELECT/gi,
    /OR\s+1\s*=\s*1/gi,
    /AND\s+1\s*=\s*1/gi,
    /EXEC(\s|\()+/gi,
    /xp_/gi
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(sanitized)) {
      console.warn('Potentially dangerous SQL pattern detected');
      return '';
    }
  }
  
  return sanitized;
};

export const sanitizeColumnName = (name: string): string => {
  if (!name) return '';
  
  // Remove leading underscores or dollar signs
  let sanitized = name.replace(/^[_$]+/, '');
  
  // Only allow alphanumeric and underscore
  sanitized = sanitized.replace(/[^a-zA-Z0-9_]/g, '');
  
  // Ensure it's not a reserved keyword
  const reservedKeywords = new Set([
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE',
    'DROP', 'CREATE', 'ALTER', 'TABLE', 'INDEX', 'VIEW',
    'UNION', 'JOIN', 'ORDER', 'GROUP', 'HAVING', 'LIMIT'
  ]);
  
  if (reservedKeywords.has(sanitized.toUpperCase())) {
    console.warn('Reserved keyword used as column name:', sanitized);
    return `_column_${sanitized}`;
  }
  
  return sanitized || 'column';
};

export const sanitizeTableName = (name: string): string => {
  if (!name) return '';
  
  // Only allow alphanumeric characters
  const sanitized = name.replace(/[^a-z0-9]/gi, '');
  
  return sanitized || 'table';
};

// Add new helper for parameterized queries
export const createParameterizedQuery = (
  baseQuery: string,
  params: Record<string, any>,
  values?: any[]
): { query: string; values: any[] } => {
  const resultValues: any[] = values || [];
  let paramIndex = 1;
  
  const query = baseQuery.replace(/:(\w+)/g, (match, paramName) => {
    if (params.hasOwnProperty(paramName)) {
      resultValues.push(params[paramName]);
      return `$${paramIndex++}`;
    }
    return match;
  });
  
  return { query, values: resultValues };
};
const folderReservedRe = /^[+\$#^]+/;
const illegalRe = /[\/\?<>\\:\*\|":]/g;
const controlRe = /[\x00-\x1f\x80-\x9f]/g;
const reservedRe = /^\.+$/;
const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;

export const sanitizeFolderName = (name: string) => {
  const replacement = "";
  return name
    .replace(folderReservedRe, replacement)
    .replace(illegalRe, replacement)
    .replace(controlRe, replacement)
    .replace(reservedRe, replacement)
    .replace(windowsReservedRe, replacement);
};
export const sanitizeFileName = (name: string) => {
  const replacement = "";
  return name
    .replace(illegalRe, replacement)
    .replace(controlRe, replacement)
    .replace(reservedRe, replacement)
    .replace(windowsReservedRe, replacement);
};

