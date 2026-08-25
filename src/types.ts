export type ViewMode = '2d' | '3d' | 'split'

export type Room = {
  id: string
  name: string
  x: number
  z: number
  width: number
  depth: number
  wallHeight: number
  floor: string
}

export type FurnitureKind =
  | 'sofa'
  | 'table'
  | 'chair'
  | 'bed'
  | 'desk'
  | 'storage'
  | 'island'
  | 'plant'

export type FurnitureItem = {
  id: string
  kind: FurnitureKind
  label: string
  x: number
  z: number
  width: number
  depth: number
  height: number
  rotation: number
  color: string
}

export type HousePlan = {
  version: 1
  name: string
  wallThickness: number
  gridSize: number
  rooms: Room[]
  furniture: FurnitureItem[]
}

export type Selection =
  | { kind: 'room'; id: string }
  | { kind: 'furniture'; id: string }
  | null
