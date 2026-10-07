'use client'

export type BasemapProvider =
  | 'esri-satellite'
  | 'carto-dark'
  | 'osm-standard'
  | 'carto-voyager'
  | 'maptiler-satellite'
  | 'mapbox-satellite'
  | 'custom'

export interface MapSettings {
  provider: BasemapProvider
  mapTilerKey: string
  mapboxToken: string
  customTileUrl: string
  showLabels: boolean
}

export const DEFAULT_MAP_SETTINGS: MapSettings = {
  provider: 'esri-satellite',
  mapTilerKey: '',
  mapboxToken: '',
  customTileUrl: '',
  showLabels: true,
}

const STORAGE_KEY = 'abuvolkanik_map_config_v1'

export function getStoredMapSettings(): MapSettings {
  if (typeof window === 'undefined') return DEFAULT_MAP_SETTINGS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_MAP_SETTINGS
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_MAP_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_MAP_SETTINGS
  }
}

export function saveStoredMapSettings(settings: MapSettings): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (e) {
    console.error('Failed to save map settings', e)
  }
}

/**
 * Generate MapLibre style object based on user settings
 */
export function buildMapStyle(settings: MapSettings): any {
  const { provider, mapTilerKey, mapboxToken, customTileUrl, showLabels } = settings

  // Provider: MapTiler dengan API Key
  if (provider === 'maptiler-satellite') {
    const key = mapTilerKey.trim()
    if (key) {
      return `https://api.maptiler.com/maps/satellite/style.json?key=${key}`
    }
  }

  // Provider: Mapbox dengan Access Token
  if (provider === 'mapbox-satellite') {
    const token = mapboxToken.trim()
    if (token) {
      return {
        version: 8,
        sources: {
          'mapbox-satellite': {
            type: 'raster',
            tiles: [
              `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.jpg90?access_token=${token}`,
            ],
            tileSize: 256,
            attribution: '&copy; Mapbox &copy; OpenStreetMap',
            maxzoom: 19,
          },
        },
        layers: [
          {
            id: 'mapbox-satellite-base',
            type: 'raster',
            source: 'mapbox-satellite',
            paint: { 'raster-opacity': 0.95 },
          },
        ],
      }
    }
  }

  // Provider: Custom Tile URL
  if (provider === 'custom' && customTileUrl.trim()) {
    return {
      version: 8,
      sources: {
        'custom-tiles': {
          type: 'raster',
          tiles: [customTileUrl.trim()],
          tileSize: 256,
          attribution: 'Custom Basemap',
          maxzoom: 19,
        },
      },
      layers: [
        {
          id: 'custom-base',
          type: 'raster',
          source: 'custom-tiles',
          paint: { 'raster-opacity': 0.95 },
        },
      ],
    }
  }

  // Provider: CARTO Dark Matter (Sangat direkomendasikan untuk tema malam/vulkanik)
  if (provider === 'carto-dark') {
    return {
      version: 8,
      sources: {
        'carto-dark': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
            'https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
            'https://c.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
            'https://d.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          maxzoom: 19,
        },
      },
      layers: [
        {
          id: 'carto-dark-base',
          type: 'raster',
          source: 'carto-dark',
          paint: { 'raster-opacity': 0.98 },
        },
      ],
    }
  }

  // Provider: OpenStreetMap Standar
  if (provider === 'osm-standard') {
    return {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: [
            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors',
          maxzoom: 19,
        },
      },
      layers: [
        {
          id: 'osm-base',
          type: 'raster',
          source: 'osm-tiles',
          paint: { 'raster-opacity': 0.95 },
        },
      ],
    }
  }

  // Provider: CARTO Voyager
  if (provider === 'carto-voyager') {
    return {
      version: 8,
      sources: {
        'carto-voyager': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
            'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
            'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          maxzoom: 19,
        },
      },
      layers: [
        {
          id: 'carto-voyager-base',
          type: 'raster',
          source: 'carto-voyager',
          paint: { 'raster-opacity': 0.95 },
        },
      ],
    }
  }

  // Default: ESRI World Imagery (Satelit) + CARTO Voyager Labels
  return {
    version: 8,
    sources: {
      'esri-satellite': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
        attribution:
          'Imagery &copy; Esri, Maxar, Earthstar Geographics',
        maxzoom: 18,
      },
      ...(showLabels
        ? {
            'esri-labels': {
              type: 'raster',
              tiles: [
                'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
              ],
              tileSize: 256,
              attribution: 'Labels &copy; Esri, HERE, Garmin',
              maxzoom: 19,
            },
          }
        : {}),
    },
    layers: [
      {
        id: 'satellite-base',
        type: 'raster',
        source: 'esri-satellite',
        paint: {
          'raster-opacity': 0.95,
        },
      },
      ...(showLabels
        ? [
            {
              id: 'labels-overlay',
              type: 'raster',
              source: 'esri-labels',
              paint: {
                'raster-opacity': 0.85,
              },
            },
          ]
        : []),
    ],
  }
}
