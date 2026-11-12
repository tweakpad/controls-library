import { parseColor, serializeColor, type ColorValue } from '../color/index.js';
import {
  MAX_PALETTE_STOPS,
  type ColorCollection,
  type ColorCollectionAttribution,
  type ColorCollectionColor,
  type ColorCollectionGroup,
  type ColorCollectionPalette,
  type PaletteIssue,
  type PaletteSet,
  type PaletteSwatch,
  type ResolvedColorCollection,
} from './types.js';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value : undefined;
const list = (value: unknown): readonly unknown[] => (Array.isArray(value) ? value : []);

/**
 * Checks the shape of a collection document, such as parsed JSON fetched at run time, and returns
 * it as a typed collection. Entries of the wrong shape are dropped and listed in `issues`; color
 * texts are checked when the collection is resolved. Throws a `TypeError` when the document is
 * not an object with an `id` and a `colors` list.
 */
export function parseColorCollection(document: unknown): {
  collection: ColorCollection;
  issues: readonly PaletteIssue[];
} {
  if (!isRecord(document) || !text(document.id) || !Array.isArray(document.colors))
    throw new TypeError('A color collection needs an id and a colors list.');
  const issues: PaletteIssue[] = [];
  const drop = (code: string, message: string) => issues.push({ code, message });
  const colors: ColorCollectionColor[] = [];
  for (const entry of document.colors) {
    if (typeof entry === 'string') colors.push(entry);
    else if (isRecord(entry) && text(entry.value))
      colors.push({
        value: entry.value as string,
        ...(text(entry.name) ? { name: entry.name as string } : {}),
        ...(text(entry.group) ? { group: entry.group as string } : {}),
      });
    else drop('color-palette-color', `A color of ${document.id} is neither a text nor a value.`);
  }
  const groups: ColorCollectionGroup[] = [];
  for (const entry of list(document.groups))
    if (isRecord(entry) && text(entry.id))
      groups.push({
        id: entry.id as string,
        ...(text(entry.name) ? { name: entry.name as string } : {}),
      });
    else drop('color-palette-group', `A group of ${document.id} has no id.`);
  const palettes: ColorCollectionPalette[] = [];
  for (const entry of list(document.palettes)) {
    if (!isRecord(entry) || !Array.isArray(entry.colors)) {
      drop('color-palette-palette', `A palette of ${document.id} has no colors list.`);
      continue;
    }
    const weights =
      Array.isArray(entry.weights) && entry.weights.every(isWeight)
        ? { weights: entry.weights as number[] }
        : {};
    palettes.push({
      ...(text(entry.name) ? { name: entry.name as string } : {}),
      colors: entry.colors.filter((color): color is string => typeof color === 'string'),
      ...weights,
    });
  }
  // One source, or several; a source keeps only its text fields, and an empty one is dropped.
  const source = (entry: unknown): ColorCollectionAttribution | undefined => {
    if (!isRecord(entry)) return undefined;
    const kept = {
      ...(text(entry.name) ? { name: entry.name as string } : {}),
      ...(text(entry.url) ? { url: entry.url as string } : {}),
      ...(text(entry.license) ? { license: entry.license as string } : {}),
    };
    return Object.keys(kept).length ? kept : undefined;
  };
  const sources = Array.isArray(document.attribution)
    ? document.attribution
        .map(source)
        .filter((entry): entry is ColorCollectionAttribution => !!entry)
    : undefined;
  const attribution = sources
    ? sources.length
      ? sources
      : undefined
    : source(document.attribution);
  return {
    collection: {
      id: document.id as string,
      ...(text(document.name) ? { name: document.name as string } : {}),
      ...(text(document.description) ? { description: document.description as string } : {}),
      ...(attribution ? { attribution } : {}),
      groups,
      colors,
      palettes,
    },
    issues,
  };
}

const isWeight = (value: unknown): boolean =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

/** The hex identity of a color, which matches a value to a swatch. */
export function colorIdentity(value: ColorValue): string {
  return serializeColor(value, 'hex');
}

const cache = new WeakMap<ColorCollection, ResolvedColorCollection>();

/**
 * Parses the colors of a collection and resolves its palettes, once per document object. Colors
 * that do not parse, references to undeclared groups and palettes with fewer than two colors are
 * dropped and listed in `issues`; a palette keeps at most {@link MAX_PALETTE_STOPS} colors, and
 * its weights, when one is given per color, are normalized to their sum.
 */
export function resolveColorCollection(collection: ColorCollection): ResolvedColorCollection {
  const cached = cache.get(collection);
  if (cached) return cached;
  const issues: PaletteIssue[] = [];
  const declared = new Set((collection.groups ?? []).map((group) => group.id));
  const swatches: PaletteSwatch[] = [];
  const byIdentity = new Map<string, PaletteSwatch>();
  collection.colors.forEach((entry, index) => {
    const swatch = typeof entry === 'string' ? { value: entry } : entry;
    const parsed = parseColor(swatch.value);
    if (!parsed) {
      issues.push({
        code: 'color-palette-color',
        message: `${collection.id}: "${swatch.value}" is not a color.`,
      });
      return;
    }
    let group = swatch.group;
    if (group !== undefined && !declared.has(group)) {
      issues.push({
        code: 'color-palette-group',
        message: `${collection.id}: the group "${group}" of "${swatch.value}" is not declared.`,
      });
      group = undefined;
    }
    const resolved: PaletteSwatch = {
      key: `c${index}`,
      value: swatch.value,
      ...(swatch.name ? { name: swatch.name } : {}),
      ...(group !== undefined ? { group } : {}),
      color: parsed,
      index,
      identity: colorIdentity(parsed),
    };
    swatches.push(resolved);
    if (!byIdentity.has(resolved.identity)) byIdentity.set(resolved.identity, resolved);
  });
  const presets = (entries: readonly ColorCollectionPalette[]): PaletteSet[] => {
    const sets: PaletteSet[] = [];
    entries.forEach((entry, setIndex) => {
      const members: PaletteSwatch[] = [];
      const kept: number[] = [];
      if (entry.colors.length > MAX_PALETTE_STOPS)
        issues.push({
          code: 'color-palette-palette',
          message: `${collection.id}: ${entry.name ?? `palette ${setIndex + 1}`} has more than ${MAX_PALETTE_STOPS} colors; it keeps the first ${MAX_PALETTE_STOPS}.`,
        });
      entry.colors.slice(0, MAX_PALETTE_STOPS).forEach((value, index) => {
        const parsed = parseColor(value);
        if (!parsed) {
          issues.push({
            code: 'color-palette-palette',
            message: `${collection.id}: "${value}" in a palette is not a color.`,
          });
          return;
        }
        const identity = colorIdentity(parsed);
        // A preset color that is in the collection keeps the collection's name and text.
        members.push(
          byIdentity.get(identity) ?? {
            key: `palette${setIndex}-${index}`,
            value,
            color: parsed,
            index: -1,
            identity,
          },
        );
        kept.push(index);
      });
      if (members.length < 2) {
        issues.push({
          code: 'color-palette-palette',
          message: `${collection.id}: a palette needs at least two colors.`,
        });
        return;
      }
      const given = entry.weights;
      const weights =
        given && given.length === entry.colors.length
          ? normalizeWeights(kept.map((index) => given[index]!))
          : undefined;
      sets.push({
        key: `collection:palette:${setIndex}`,
        ...(entry.name ? { name: entry.name } : {}),
        swatches: members,
        ...(weights ? { weights } : {}),
      });
    });
    return sets;
  };
  const resolved: ResolvedColorCollection = {
    id: collection.id,
    ...(collection.name ? { name: collection.name } : {}),
    ...(collection.description ? { description: collection.description } : {}),
    ...(collection.attribution ? { attribution: collection.attribution } : {}),
    groups: collection.groups ?? [],
    swatches,
    palettes: presets(collection.palettes ?? []),
    issues,
    source: collection,
  };
  cache.set(collection, resolved);
  return resolved;
}

/** Weights as shares of their sum; equal shares when they sum to zero. */
export function normalizeWeights(weights: readonly number[]): readonly number[] {
  const sum = weights.reduce((total, weight) => total + weight, 0);
  return sum > 0 ? weights.map((weight) => weight / sum) : weights.map(() => 1 / weights.length);
}
