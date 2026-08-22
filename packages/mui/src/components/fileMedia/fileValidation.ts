import type { MuiFileValidationError } from './types';

function matchesAccept(file: File, accept: string): boolean {
  const rules = accept.split(',').map((rule) => rule.trim().toLowerCase()).filter(Boolean);
  if (rules.length === 0) return true;
  const fileName = file.name.toLowerCase();
  const mime = file.type.toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith('.')) return fileName.endsWith(rule);
    if (rule.endsWith('/*')) return mime.startsWith(rule.slice(0, -1));
    return mime === rule;
  });
}

export function validateFiles(files: readonly File[], options: { accept?: string; maxFileSize?: number; maxFiles?: number; existingCount?: number }): MuiFileValidationError[] {
  const errors: MuiFileValidationError[] = [];
  if (options.maxFiles !== undefined && (options.existingCount ?? 0) + files.length > options.maxFiles) {
    errors.push({ code: 'count', message: `Select no more than ${options.maxFiles} file${options.maxFiles === 1 ? '' : 's'}.` });
  }
  for (const file of files) {
    if (options.accept && !matchesAccept(file, options.accept)) {
      errors.push({ code: 'type', fileName: file.name, message: `${file.name} is not an accepted file type.` });
    }
    if (options.maxFileSize !== undefined && file.size > options.maxFileSize) {
      errors.push({ code: 'size', fileName: file.name, message: `${file.name} exceeds the ${formatFileSize(options.maxFileSize)} limit.` });
    }
  }
  return errors;
}

export function formatFileSize(bytes?: number): string {
  if (bytes === undefined) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}
