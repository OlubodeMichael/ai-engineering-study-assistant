const REFERENCE_ANCHOR_PATTERN = /--ref-\d+$/;

export function exchangeElementId(exchangeId: string): string {
  return `${exchangeId}--view`;
}

/** Element ID for a course reference, unique across every answer on the page. */
export function referenceAnchorId(exchangeId: string, displayNumber: number): string {
  return `${exchangeId}--ref-${displayNumber}`;
}

export function isReferenceAnchorId(id: string): boolean {
  return REFERENCE_ANCHOR_PATTERN.test(id);
}
