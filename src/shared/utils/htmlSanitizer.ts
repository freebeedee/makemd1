import DOMPurify from 'dompurify';

export const sanitizeHTML = (html: string): string => {
  if (!html) return '';
  
  if (typeof window === 'undefined') {
    // Server-side fallback - basic sanitization
    return html.replace(/<script[^>]*>.*?<\/script>/gi, '')
               .replace(/on\w+=".*?"/gi, '')
               .replace(/javascript:/gi, '');
  }
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'img',
      'code', 'pre', 'blockquote', 'table', 'tr', 'td', 'th',
      'thead', 'tbody', 'sup', 'sub', 'mark', 'del', 'ins', 'u'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id', 'style',
      'target', 'rel', 'colspan', 'rowspan', 'width', 'height'
    ],
    ALLOW_DATA_URI: false,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onclick', 'onerror', 'onload', 'onmouseover', 'onfocus', 'onblur']
  });
};

export const createSafeImageElement = (src: string, alt?: string): HTMLImageElement => {
  const img = new Image();
  img.src = sanitizeHTML(src);
  if (alt) {
    img.alt = sanitizeHTML(alt);
  }
  img.crossOrigin = 'anonymous';
  return img;
};

export const sanitizeInnerHTML = (element: HTMLElement, html: string): void => {
  element.innerHTML = sanitizeHTML(html);
};

export const safeSetInnerHTML = (element: Element | null | undefined, html: string): void => {
  if (!element) return;
  element.innerHTML = sanitizeHTML(html);
};
