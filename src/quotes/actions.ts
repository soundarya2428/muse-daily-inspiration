import type { Quote } from '@/quotes/data';

export function formatQuote(quote: Quote): string {
  return `“${quote.text}”\n— ${quote.author}`;
}

export async function copyQuoteToClipboard(quote: Quote): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(formatQuote(quote));
    return true;
  } catch {
    return false;
  }
}

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

export async function shareQuote(quote: Quote): Promise<ShareResult> {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: 'MUSE', text: formatQuote(quote) });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
      return 'failed';
    }
  }
  const copied = await copyQuoteToClipboard(quote);
  return copied ? 'copied' : 'failed';
}
