export type MapFeature = {
  properties?: { NAME_1?: string; name?: string };
  geometry?: { type?: string; coordinates?: unknown };
};

type StoryWithState = { state?: string | null };

const STATE_NAME_ALIASES: Record<string, string> = {
  orissa: 'Odisha',
  uttaranchal: 'Uttarakhand',
  'andaman and nicobar': 'Andaman and Nicobar Islands',
  'andaman & nicobar islands': 'Andaman and Nicobar Islands',
  'dadra and nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
  'daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
};

export function canonicalStateName(stateName: string): string {
  const trimmed = stateName.trim().replace(/\s+/g, ' ');
  const normalized = trimmed.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return STATE_NAME_ALIASES[normalized.toLocaleLowerCase('en-IN')] ?? normalized;
}

export function stateNameKey(stateName: string): string {
  return canonicalStateName(stateName).toLocaleLowerCase('en-IN');
}

export function getMapFeatureName(feature: MapFeature): string | null {
  const name = feature.properties?.NAME_1 ?? feature.properties?.name;
  return typeof name === 'string' && name.trim() ? name.trim() : null;
}

export function getStateNames(stories: StoryWithState[]): string[] {
  const names = new Map<string, string>();

  for (const story of stories) {
    const stateName = story.state?.trim();
    if (!stateName || stateName.toLocaleLowerCase('en-IN') === 'national') continue;
    const canonicalName = canonicalStateName(stateName);
    names.set(stateNameKey(canonicalName), canonicalName);
  }

  return [...names.values()].sort((a, b) => a.localeCompare(b));
}

export function getStateLinkedStories<T extends StoryWithState>(stories: T[]): T[] {
  return stories.filter((story) => {
    const stateName = story.state?.trim();
    return Boolean(stateName) && stateName?.toLocaleLowerCase('en-IN') !== 'national';
  });
}

export function getStoriesForState<T extends StoryWithState>(
  stories: T[],
  stateName: string,
): T[] {
  const key = stateNameKey(stateName);
  return stories.filter((story) => story.state && stateNameKey(story.state) === key);
}

export function getUnmappedStateNames(
  stateNames: string[],
  features: MapFeature[],
): string[] {
  const mappedKeys = new Set(
    features
      .map(getMapFeatureName)
      .filter((name): name is string => Boolean(name))
      .map(stateNameKey),
  );
  return stateNames.filter((stateName) => !mappedKeys.has(stateNameKey(stateName)));
}

export function toggleStateSelection(
  selected: string | null,
  stateName: string,
): string | null {
  return selected && stateNameKey(selected) === stateNameKey(stateName)
    ? null
    : canonicalStateName(stateName);
}

export function isMapSelectionKey(key: string): boolean {
  return key === 'Enter' || key === ' ';
}

function isPosition(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  );
}

function isLinearRing(value: unknown): value is number[][] {
  return Array.isArray(value) && value.length >= 4 && value.every(isPosition);
}

function isPolygon(value: unknown): value is number[][][] {
  return Array.isArray(value) && value.length > 0 && value.every(isLinearRing);
}

function isValidGeometry(geometry: MapFeature['geometry']): boolean {
  if (!geometry) return false;
  if (geometry.type === 'Polygon') return isPolygon(geometry.coordinates);
  if (geometry.type === 'MultiPolygon') {
    return (
      Array.isArray(geometry.coordinates) &&
      geometry.coordinates.length > 0 &&
      geometry.coordinates.every(isPolygon)
    );
  }
  return false;
}

export function parseStateMap(value: unknown): MapFeature[] {
  if (!value || typeof value !== 'object') {
    throw new Error('The state map must be a GeoJSON feature collection.');
  }

  const collection = value as { type?: unknown; features?: unknown };
  if (collection.type !== 'FeatureCollection' || !Array.isArray(collection.features) || !collection.features.length) {
    throw new Error('The state map has no valid features.');
  }

  const features = collection.features as MapFeature[];
  if (
    features.some(
      (feature) =>
        !feature ||
        typeof feature !== 'object' ||
        !getMapFeatureName(feature) ||
        !isValidGeometry(feature.geometry),
    )
  ) {
    throw new Error('The state map contains a missing name or malformed boundary.');
  }

  return features;
}

function projectMapPoint(point: number[]): string {
  const x = ((point[0] - 68) / 30) * 1000;
  const y = 950 - ((point[1] - 6) / 31) * 950;
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}

export function mapPath(coords: unknown): string {
  if (!Array.isArray(coords) || !coords.length) return '';
  if (typeof coords[0] === 'number') return `M${projectMapPoint(coords as number[])} `;
  if (Array.isArray(coords[0]) && typeof coords[0][0] === 'number') {
    const points = (coords as number[][]).map(projectMapPoint);
    return `M${points.join(' L')} Z`;
  }
  return (coords as unknown[]).map(mapPath).join(' ');
}