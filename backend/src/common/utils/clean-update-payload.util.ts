type MongoUpdate = {
  $set: Record<string, unknown>;
  $unset: Record<string, ''>;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function cleanArray(values: unknown[]): unknown[] {
  return values
    .map((value) => (typeof value === 'string' ? value.trim() : value))
    .filter((value) => value !== '' && value !== null && value !== undefined);
}

export function cleanCreatePayload(
  input: Record<string, unknown>,
): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  for (const [key, rawValue] of Object.entries(input)) {
    if (rawValue === null || rawValue === undefined) continue;
    if (typeof rawValue === 'string') {
      const value = rawValue.trim();
      if (value) output[key] = value;
      continue;
    }
    if (Array.isArray(rawValue)) {
      output[key] = cleanArray(rawValue);
      continue;
    }
    if (isPlainObject(rawValue)) {
      const nested = cleanCreatePayload(rawValue);
      if (Object.keys(nested).length) output[key] = nested;
      continue;
    }
    output[key] = rawValue;
  }

  return output;
}

export function cleanUpdatePayload(
  input: Record<string, unknown>,
  prefix = '',
): MongoUpdate {
  const update: MongoUpdate = { $set: {}, $unset: {} };

  for (const [key, rawValue] of Object.entries(input)) {
    if (rawValue === undefined) continue;
    const path = prefix ? `${prefix}.${key}` : key;

    if (rawValue === null || rawValue === '') {
      update.$unset[path] = '';
      continue;
    }
    if (typeof rawValue === 'string') {
      const value = rawValue.trim();
      if (value) update.$set[path] = value;
      else update.$unset[path] = '';
      continue;
    }
    if (Array.isArray(rawValue)) {
      update.$set[path] = cleanArray(rawValue);
      continue;
    }
    if (isPlainObject(rawValue)) {
      const nested = cleanUpdatePayload(rawValue, path);
      Object.assign(update.$set, nested.$set);
      Object.assign(update.$unset, nested.$unset);
      continue;
    }
    update.$set[path] = rawValue;
  }

  return update;
}

export function cleanUniqueStrings(values?: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const rawValue of values ?? []) {
    const value = rawValue.trim();
    const key = value.toLocaleLowerCase();
    if (!value || seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }

  return result;
}
