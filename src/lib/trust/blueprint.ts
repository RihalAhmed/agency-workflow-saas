import type { Blueprint, BlueprintRegion, Niche, Region, TrustSignals } from "./types";

/**
 * Clean 3-line helper to map object values without lodash dependency.
 */
function mapValues<T extends Record<string, any>, U>(
  obj: T,
  fn: (val: T[keyof T], key: keyof T) => U
): Record<keyof T, U> {
  const result = {} as Record<keyof T, U>;
  for (const key of Object.keys(obj) as Array<keyof T>) {
    result[key] = fn(obj[key], key);
  }
  return result;
}

/**
 * Reverse mode: Extracts a reusable Blueprint comparison standard
 * from a portfolio piece's detected signals.
 */
export function extractBlueprint(
  signals: TrustSignals,
  niche: Niche,
  portfolioPieceId: string
): Blueprint {
  const regions = mapValues(signals.regions, (r): BlueprintRegion => ({
    present: r.found,
    slots: r.slots
      .filter((s) => s.state === "found")
      .map((s) => ({
        slot: s.slot,
        state: "present" as const,
        bbox: s.bbox,
        evidence: s.evidence,
      })),
  })) as Record<Region, BlueprintRegion>;

  return {
    id: crypto.randomUUID(),
    niche,
    sourcePortfolioPieceId: portfolioPieceId,
    regions,
  };
}

/**
 * Checks if a Blueprint has fewer than 3 present regions, indicating a weak reference.
 */
export function isWeakBlueprint(blueprint: Blueprint): boolean {
  const presentCount = Object.values(blueprint.regions).filter((r) => r.present).length;
  return presentCount < 3;
}
