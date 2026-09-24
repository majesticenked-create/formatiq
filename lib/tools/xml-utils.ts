export type ParseXmlResult = { ok: true; doc: Document } | { ok: false; message: string };

/**
 * Parses XML using the browser's native `DOMParser`, the same well-formedness engine used by
 * xml-formatter. Centralized here so xml-minifier, xml-parser, and xpath-tester share one
 * parsing/error-extraction path instead of duplicating `DOMParser` setup three times.
 *
 * Security note: `DOMParser` never resolves external entities or DTDs against the network or
 * filesystem - that's a standard browser platform guarantee (no XXE), not something this code
 * has to enforce itself.
 */
export function parseXml(input: string): ParseXmlResult {
  if (typeof DOMParser === 'undefined') {
    return { ok: false, message: 'Loading...' };
  }

  if (!input.trim()) {
    return { ok: false, message: 'Paste some XML.' };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(input, 'application/xml');
  const errorNode = doc.querySelector('parsererror');

  if (errorNode) {
    return { ok: false, message: errorNode.textContent?.trim() ?? 'Invalid XML' };
  }

  if (!doc.documentElement) {
    return { ok: false, message: 'No root element found.' };
  }

  return { ok: true, doc };
}

/**
 * Recursively removes whitespace-only text nodes that exist purely for indentation between
 * element siblings (a text node made entirely of whitespace, adjacent to element children).
 * Mixed content - actual text sitting alongside elements, e.g. `<p>Hello <b>world</b>!</p>` -
 * is left completely untouched, since that whitespace/text is semantically meaningful and
 * removing it would change the document's content, not just its formatting.
 */
export function stripIndentationWhitespace(node: Node): void {
  const children = Array.from(node.childNodes);
  const hasElementChild = children.some((c) => c.nodeType === Node.ELEMENT_NODE);

  for (const child of children) {
    if (child.nodeType === Node.TEXT_NODE) {
      const isWhitespaceOnly = /^\s*$/.test(child.textContent ?? '');
      // Only formatting-only whitespace between element siblings is removed. A whitespace-only
      // text node in an element with NO element children (e.g. `<a>   </a>`) is left alone,
      // since there's no sibling structure to prove it's mere indentation rather than content.
      if (isWhitespaceOnly && hasElementChild) {
        node.removeChild(child);
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      stripIndentationWhitespace(child);
    }
  }
}

/**
 * Serializes a Document/Node back to an XML string via the browser's native `XMLSerializer` -
 * never string concatenation of user content, and never `dangerouslySetInnerHTML`.
 */
export function serializeXml(node: Node): string {
  return new XMLSerializer().serializeToString(node);
}

/**
 * Pretty-prints a parsed element with indentation (2 spaces per depth), the same approach used by
 * xml-formatter, generalized here so other tools (e.g. base64-to-xml) can reuse it instead of
 * duplicating the recursive-serialization logic.
 */
export function formatXmlElement(node: Element, depth = 0): string {
  const indent = ' '.repeat(2 * depth);

  const attrs = Array.from(node.attributes)
    .map((attr) => ` ${attr.name}="${attr.value}"`)
    .join('');

  const elementChildren = Array.from(node.childNodes).filter(
    (n) => n.nodeType === Node.ELEMENT_NODE
  ) as Element[];
  const textContent = Array.from(node.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent?.trim() ?? '')
    .join('');

  if (elementChildren.length === 0) {
    if (textContent) {
      return `${indent}<${node.tagName}${attrs}>${textContent}</${node.tagName}>`;
    }
    return `${indent}<${node.tagName}${attrs}/>`;
  }

  const children = elementChildren.map((child) => formatXmlElement(child, depth + 1)).join('\n');
  return `${indent}<${node.tagName}${attrs}>\n${children}\n${indent}</${node.tagName}>`;
}
