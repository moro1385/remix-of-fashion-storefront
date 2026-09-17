export function slugify(text: string): string {
  return text
    .trim()
    .replace(/[/\\?%*:|"<>]/g, '')   // strip characters unsafe in URLs
    .replace(/\s+/g, '-')             // collapse whitespace to single hyphens
    .replace(/-+/g, '-')              // collapse multiple hyphens
    .replace(/^-+|-+$/g, '');         // trim leading/trailing hyphens
}
