import type { Link, Parent, PhrasingContent, Root, RootContent, Text } from "mdast";
import type { CitationTarget } from "../types";
import { CITATION_GROUP_PATTERN, parseCitationGroup } from "./citations";

const SKIPPED_PARENT_TYPES = new Set(["link", "linkReference", "code", "inlineCode"]);

export interface RemarkCitationsOptions {
  targets: ReadonlyMap<number, CitationTarget>;
}

function citationLink(target: CitationTarget): Link {
  return {
    type: "link",
    url: `#${target.anchorId}`,
    title: target.title,
    data: { hProperties: { ariaLabel: `Reference ${target.displayNumber}: ${target.title}` } },
    children: [{ type: "text", value: String(target.displayNumber) }],
  };
}

/** Resolves "1, 2, 3" to unique document targets, or null if any is unknown. */
function resolveGroup(
  group: string,
  targets: ReadonlyMap<number, CitationTarget>,
): CitationTarget[] | null {
  const resolved = new Map<number, CitationTarget>();
  for (const citation of parseCitationGroup(group)) {
    const target = targets.get(citation);
    if (!target) return null;
    resolved.set(target.displayNumber, target);
  }
  return [...resolved.values()];
}

function splitCitations(node: Text, options: RemarkCitationsOptions): PhrasingContent[] {
  const parts: PhrasingContent[] = [];
  let lastIndex = 0;
  let previous: CitationTarget | null = null;

  for (const match of node.value.matchAll(CITATION_GROUP_PATTERN)) {
    const resolved = resolveGroup(match[1], options.targets);
    if (!resolved) continue;

    const between = node.value.slice(lastIndex, match.index);
    const isAdjacent: boolean = previous !== null && between.trim() === "";
    const repeatsPrevious: boolean =
      isAdjacent && resolved[0].displayNumber === previous?.displayNumber;
    const toEmit: CitationTarget[] = repeatsPrevious ? resolved.slice(1) : resolved;

    if (toEmit.length > 0) {
      if (between) parts.push({ type: "text", value: between });
      parts.push(...toEmit.map(citationLink));
      previous = toEmit[toEmit.length - 1];
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex === 0) return [node];
  if (lastIndex < node.value.length) {
    parts.push({ type: "text", value: node.value.slice(lastIndex) });
  }
  return parts;
}

function transformParent(parent: Parent, options: RemarkCitationsOptions): void {
  if (SKIPPED_PARENT_TYPES.has(parent.type)) return;

  parent.children = parent.children.flatMap<RootContent>((child) => {
    if (child.type === "text") return splitCitations(child, options);
    if ("children" in child) transformParent(child, options);
    return [child];
  });
}

/**
 * Remark plugin that renders citation markers such as [1] or [1, 2] as small
 * links numbered by course document. The answer text itself is unchanged;
 * renumbering happens only in the rendered tree.
 */
export function remarkCitations(options: RemarkCitationsOptions) {
  return (tree: Root): void => {
    transformParent(tree, options);
  };
}
