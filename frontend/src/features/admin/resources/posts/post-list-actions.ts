export function buildBulkTaxonomyPayload(
  type: "category" | "tag",
  ids: string[],
  taxonomyId: string,
) {
  if (!taxonomyId) return null;
  return {
    action: type === "category" ? "set-category" : "add-tag",
    ids,
    data: type === "category" ? { categoryId: taxonomyId } : { tagId: taxonomyId },
  };
}

export function matchesPermanentDeleteTitle(
  expectedTitle: string,
  confirmation: string,
) {
  return expectedTitle === confirmation;
}
