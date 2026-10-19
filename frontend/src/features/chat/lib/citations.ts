/** Matches citation markers such as [1] or [1, 2]. */
export const CITATION_GROUP_PATTERN = /\[(\d+(?:\s*,\s*\d+)*)\]/g;

export function parseCitationGroup(group: string): number[] {
  return group.split(",").map((value) => Number(value.trim()));
}
