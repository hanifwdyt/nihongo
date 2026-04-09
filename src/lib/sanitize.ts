/**
 * Sanitize HTML to only allow safe markdown-derived tags.
 * Escapes all HTML first, then re-enables only <strong>, <em>, <code>, <br>.
 */
export function sanitizeHtml(text: string): string {
  // Escape all HTML entities first
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  // Apply markdown-style formatting on the escaped text
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-zinc-200 dark:bg-zinc-700 px-1 rounded text-sm">$1</code>')
    .replace(/\n/g, '<br />');
}
