"use client";

import { useCellValues } from "@mdxeditor/gurx";
import {
  $createDirectiveNode,
  $isDirectiveNode,
  activeEditor$,
  codeBlockEditorDescriptors$,
  currentSelection$,
  defaultCodeBlockLanguage$,
  directiveDescriptors$,
  editorInFocus$,
  exportLexicalTreeToMdast,
  exportVisitors$,
  importMdastTreeToLexical,
  importVisitors$,
  jsxComponentDescriptors$,
  jsxIsAvailable$,
  rootEditor$,
} from "@mdxeditor/editor";
import {
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  type LexicalNode,
  type RangeSelection,
} from "lexical";
import {
  DEFAULT_BLOG_INLINE_TEXT_OPTIONS,
  DEFAULT_BLOG_TEXT_BLOCK_OPTIONS,
  parseBlogInlineTextOptions,
  parseBlogTextBlockOptions,
  serializeBlogInlineTextAttributes,
  serializeBlogTextBlockAttributes,
  type BlogInlineTextOptions,
  type BlogTextBlockOptions,
} from "@/features/blog/markdown/blog-format-contract";
import {
  blogMarkdownText,
  type BlogMarkdownNode,
  type BlogMarkdownRoot,
} from "@/features/blog/markdown/blog-markdown-types";

type SplitResult = {
  before: BlogMarkdownNode[];
  middle: BlogMarkdownNode[];
  after: BlogMarkdownNode[];
};

function cloneWithChildren(
  node: BlogMarkdownNode,
  children: BlogMarkdownNode[],
): BlogMarkdownNode {
  return { ...structuredClone(node), children };
}

function splitNode(
  node: BlogMarkdownNode,
  start: number,
  end: number,
): SplitResult {
  const length = blogMarkdownText(node).length;
  if (end <= 0)
    return { before: [], middle: [], after: [structuredClone(node)] };
  if (start >= length)
    return { before: [structuredClone(node)], middle: [], after: [] };
  if (start <= 0 && end >= length)
    return { before: [], middle: [structuredClone(node)], after: [] };

  if (node.type === "text") {
    const value = node.value ?? "";
    const left = value.slice(0, Math.max(0, start));
    const center = value.slice(Math.max(0, start), Math.min(value.length, end));
    const right = value.slice(Math.min(value.length, end));
    const make = (text: string) =>
      text ? [{ ...structuredClone(node), value: text }] : [];
    return {
      before: make(left),
      middle: make(center),
      after: make(right),
    };
  }

  if (!node.children?.length) {
    return { before: [], middle: [structuredClone(node)], after: [] };
  }

  const split = splitChildren(node.children, start, end);
  return {
    before: split.before.length
      ? [cloneWithChildren(node, split.before)]
      : [],
    middle: split.middle.length
      ? [cloneWithChildren(node, split.middle)]
      : [],
    after: split.after.length ? [cloneWithChildren(node, split.after)] : [],
  };
}

function splitChildren(
  children: BlogMarkdownNode[],
  start: number,
  end: number,
): SplitResult {
  const result: SplitResult = { before: [], middle: [], after: [] };
  let cursor = 0;
  for (const child of children) {
    const length = blogMarkdownText(child).length;
    const split = splitNode(child, start - cursor, end - cursor);
    result.before.push(...split.before);
    result.middle.push(...split.middle);
    result.after.push(...split.after);
    cursor += length;
  }
  return result;
}

function pointOffsetWithin(
  selection: RangeSelection,
  topLevel: LexicalNode,
  point: RangeSelection["anchor"],
): number | null {
  if (!$isElementNode(topLevel)) return null;
  const textNodes = topLevel.getAllTextNodes();
  const pointNode = point.getNode();

  if ($isTextNode(pointNode)) {
    let offset = 0;
    for (const textNode of textNodes) {
      if (textNode.getKey() === pointNode.getKey()) return offset + point.offset;
      offset += textNode.getTextContentSize();
    }
    return null;
  }

  if ($isElementNode(pointNode)) {
    const children = pointNode.getChildren().slice(0, point.offset);
    return children.reduce((total, child) => total + child.getTextContentSize(), 0);
  }
  return null;
}

function currentDirectiveNode(focusNode: LexicalNode | null | undefined) {
  if (!$isDirectiveNode(focusNode)) return null;
  const serialized = focusNode.exportJSON() as ReturnType<
    typeof focusNode.exportJSON
  > & { mdastNode?: BlogMarkdownNode };
  return serialized.mdastNode ?? null;
}

export function useBlogEditorCommands() {
  const [
    rootEditor,
    activeEditor,
    editorInFocus,
    currentSelection,
    exportVisitors,
    importVisitors,
    jsxComponentDescriptors,
    jsxIsAvailable,
    directiveDescriptors,
    codeBlockEditorDescriptors,
    defaultCodeBlockLanguage,
  ] = useCellValues(
    rootEditor$,
    activeEditor$,
    editorInFocus$,
    currentSelection$,
    exportVisitors$,
    importVisitors$,
    jsxComponentDescriptors$,
    jsxIsAvailable$,
    directiveDescriptors$,
    codeBlockEditorDescriptors$,
    defaultCodeBlockLanguage$,
  );

  const focusedDirective = currentDirectiveNode(editorInFocus?.rootNode);
  const paragraphOptions =
    focusedDirective?.type === "containerDirective" &&
    focusedDirective.name === "text"
      ? parseBlogTextBlockOptions(focusedDirective.attributes)
      : DEFAULT_BLOG_TEXT_BLOCK_OPTIONS;
  const inlineOptions =
    focusedDirective?.type === "textDirective" &&
    focusedDirective.name === "text"
      ? parseBlogInlineTextOptions(focusedDirective.attributes)
      : DEFAULT_BLOG_INLINE_TEXT_OPTIONS;

  const isTextSelected = Boolean(currentSelection && !currentSelection.isCollapsed());

  const reimportRoot = (mdastRoot: BlogMarkdownRoot) => {
    const lexicalRoot = $getRoot();
    lexicalRoot.clear();
    importMdastTreeToLexical({
      root: lexicalRoot,
      mdastRoot: mdastRoot as any,
      visitors: importVisitors as any,
      jsxComponentDescriptors,
      directiveDescriptors,
      codeBlockEditorDescriptors,
      defaultCodeBlockLanguage,
    });
  };

  const updateFocusedDirective = (
    mutate: (node: BlogMarkdownNode) => BlogMarkdownNode,
  ): boolean => {
    if (!rootEditor || !editorInFocus?.rootNode || !focusedDirective)
      return false;
    const key = editorInFocus.rootNode.getKey();
    rootEditor.update(
      () => {
        const node = $getNodeByKey(key);
        if ($isDirectiveNode(node)) node.setMdastNode(mutate(focusedDirective) as any);
      },
      { discrete: true },
    );
    return true;
  };

  const applyParagraphOptions = (
    changes: Partial<BlogTextBlockOptions>,
  ): boolean => {
    const nextOptions = { ...paragraphOptions, ...changes };
    const attributes = serializeBlogTextBlockAttributes(nextOptions);

    if (
      focusedDirective?.type === "containerDirective" &&
      focusedDirective.name === "text"
    ) {
      if (Object.keys(attributes).length) {
        return updateFocusedDirective((node) => ({ ...node, attributes }));
      }
    }

    if (!rootEditor) return false;
    let changed = false;
    rootEditor.update(
      () => {
        const lexicalRoot = $getRoot();
        const rootChildren = lexicalRoot.getChildren();
        let target: LexicalNode | null = null;
        if (editorInFocus?.rootNode && $isDirectiveNode(editorInFocus.rootNode)) {
          target = $getNodeByKey(editorInFocus.rootNode.getKey());
        } else {
          const selection = $getSelection();
          if ($isRangeSelection(selection))
            target = selection.anchor.getNode().getTopLevelElement();
        }
        if (!target) return;
        const index = rootChildren.findIndex(
          (node) => node.getKey() === target?.getKey(),
        );
        if (index < 0) return;

        const mdastRoot = exportLexicalTreeToMdast({
          root: lexicalRoot,
          visitors: exportVisitors,
          jsxComponentDescriptors,
          jsxIsAvailable,
          addImportStatements: false,
        }) as BlogMarkdownRoot;
        const mdastNode = mdastRoot.children[index];
        if (!mdastNode) return;

        if (
          mdastNode.type === "containerDirective" &&
          mdastNode.name === "text"
        ) {
          if (Object.keys(attributes).length) {
            mdastRoot.children[index] = { ...mdastNode, attributes };
          } else {
            mdastRoot.children.splice(index, 1, ...(mdastNode.children ?? []));
          }
        } else if (Object.keys(attributes).length) {
          mdastRoot.children[index] = {
            type: "containerDirective",
            name: "text",
            attributes,
            children: [mdastNode],
          };
        } else {
          return;
        }
        reimportRoot(mdastRoot);
        changed = true;
      },
      { discrete: true },
    );
    return changed;
  };

  const wrapSelection = (
    name: "text" | "kbd",
    attributes: Record<string, string>,
  ): boolean => {
    if (!activeEditor) return false;
    let changed = false;
    activeEditor.update(
      () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || selection.isCollapsed()) return;
        const anchorTop = selection.anchor.getNode().getTopLevelElement();
        const focusTop = selection.focus.getNode().getTopLevelElement();
        if (
          !anchorTop ||
          !focusTop ||
          anchorTop.getKey() !== focusTop.getKey() ||
          !$isElementNode(anchorTop)
        )
          return;

        const startPoint = pointOffsetWithin(
          selection,
          anchorTop,
          selection.anchor,
        );
        const endPoint = pointOffsetWithin(selection, anchorTop, selection.focus);
        if (startPoint === null || endPoint === null) return;
        const start = Math.min(startPoint, endPoint);
        const end = Math.max(startPoint, endPoint);
        if (start === end || (name === "kbd" && end - start > 40)) return;

        const lexicalRoot = $getRoot();
        const topIndex = lexicalRoot
          .getChildren()
          .findIndex((node) => node.getKey() === anchorTop.getKey());
        if (topIndex < 0) return;
        const mdastRoot = exportLexicalTreeToMdast({
          root: lexicalRoot,
          visitors: exportVisitors,
          jsxComponentDescriptors,
          jsxIsAvailable,
          addImportStatements: false,
        }) as BlogMarkdownRoot;
        const parent = mdastRoot.children[topIndex];
        if (!parent?.children) return;
        const split = splitChildren(parent.children, start, end);
        if (!split.middle.length) return;
        parent.children = [
          ...split.before,
          {
            type: "textDirective",
            name,
            attributes,
            children:
              name === "kbd"
                ? [{ type: "text", value: split.middle.map(blogMarkdownText).join("") }]
                : split.middle,
          },
          ...split.after,
        ];
        reimportRoot(mdastRoot);
        changed = true;
      },
      { discrete: true },
    );
    return changed;
  };

  const applyInlineOptions = (
    changes: Partial<BlogInlineTextOptions>,
  ): boolean => {
    const nextOptions = { ...inlineOptions, ...changes };
    const attributes = serializeBlogInlineTextAttributes(nextOptions);
    if (
      focusedDirective?.type === "textDirective" &&
      focusedDirective.name === "text"
    ) {
      if (!Object.keys(attributes).length && rootEditor) {
        let changed = false;
        rootEditor.update(
          () => {
            const lexicalRoot = $getRoot();
            const mdastRoot = exportLexicalTreeToMdast({
              root: lexicalRoot,
              visitors: exportVisitors,
              jsxComponentDescriptors,
              jsxIsAvailable,
              addImportStatements: false,
            }) as BlogMarkdownRoot;
            const targetText = blogMarkdownText(focusedDirective);
            const targetAttributes = JSON.stringify(
              focusedDirective.attributes ?? {},
            );
            const unwrap = (parent: BlogMarkdownNode): boolean => {
              const children = parent.children ?? [];
              for (let index = 0; index < children.length; index += 1) {
                const child = children[index];
                if (
                  child.type === "textDirective" &&
                  child.name === "text" &&
                  blogMarkdownText(child) === targetText &&
                  JSON.stringify(child.attributes ?? {}) === targetAttributes
                ) {
                  children.splice(index, 1, ...(child.children ?? []));
                  return true;
                }
                if (unwrap(child)) return true;
              }
              return false;
            };
            if (unwrap(mdastRoot)) {
              reimportRoot(mdastRoot);
              changed = true;
            }
          },
          { discrete: true },
        );
        return changed;
      }
      return updateFocusedDirective((node) => ({
        ...node,
        attributes,
      }));
    }
    return wrapSelection("text", attributes);
  };

  const insertKbd = (value?: string): boolean => {
    if (isTextSelected) return wrapSelection("kbd", {});
    const text = value?.trim();
    if (!text || text.length > 40 || !activeEditor) return false;
    let changed = false;
    activeEditor.update(
      () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        selection.insertNodes([
          $createDirectiveNode({
            type: "textDirective",
            name: "kbd",
            attributes: {},
            children: [{ type: "text", value: text }],
          }),
        ]);
        changed = true;
      },
      { discrete: true },
    );
    return changed;
  };

  return {
    paragraphOptions,
    inlineOptions,
    isTextSelected,
    applyParagraphOptions,
    applyInlineOptions,
    insertKbd,
  };
}
