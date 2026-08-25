import { DEFAULT_PLAN } from '../defaultPlan'
import type { FurnitureItem, FurnitureKind, HousePlan, Room } from '../types'

export const roundToGrid = (value: number, grid = 0.1) =>
  Math.round(value / grid) * grid

export const clonePlan = (plan: HousePlan): HousePlan =>
  JSON.parse(JSON.stringify(plan)) as HousePlan

export const newPlan = () => clonePlan(DEFAULT_PLAN)

export const planBounds = (plan: HousePlan) => {
  const entries = [
    ...plan.rooms.map((room) => ({ minX: room.x, minZ: room.z, maxX: room.x + room.width, maxZ: room.z + room.depth })),
    ...plan.furniture.map((item) => ({ minX: item.x - item.width / 2, minZ: item.z - item.depth / 2, maxX: item.x + item.width / 2, maxZ: item.z + item.depth / 2 }))
  ]

  if (!entries.length) return { minX: 0, minZ: 0, maxX: 10, maxZ: 10, width: 10, depth: 10 }

  const minX = Math.min(...entries.map((entry) => entry.minX))
  const minZ = Math.min(...entries.map((entry) => entry.minZ))
  const maxX = Math.max(...entries.map((entry) => entry.maxX))
  const maxZ = Math.max(...entries.map((entry) => entry.maxZ))
  return { minX, minZ, maxX, maxZ, width: maxX - minX, depth: maxZ - minZ }
}

export const makeRoom = (count: number): Room => ({
  id: `room-${Date.now()}-${count}`,
  name: `New room ${count}`,
  x: 0.5 + count * 0.25,
  z: 0.5 + count * 0.25,
  width: 3,
  depth: 3,
  wallHeight: 2.5,
  floor: '#e8e4dc'
})

const furnitureDefaults: Record<FurnitureKind, Omit<FurnitureItem, 'id' | 'kind' | 'x' | 'z'>> = {
  sofa: { label: 'Sofa', width: 2.2, depth: 0.9, height: 0.82, rotation: 0, color: '#6c7a89' },
  table: { label: 'Table', width: 1.6, depth: 0.9, height: 0.76, rotation: 0, color: '#9c7657' },
  chair: { label: 'Chair', width: 0.55, depth: 0.55, height: 0.9, rotation: 0, color: '#8a6c55' },
  bed: { label: 'Bed', width: 2, depth: 1.5, height: 0.55, rotation: 0, color: '#c5ccd4' },
  desk: { label: 'Desk', width: 1.4, depth: 0.7, height: 0.76, rotation: 0, color: '#8c755f' },
  storage: { label: 'Storage', width: 1.2, depth: 0.45, height: 1.8, rotation: 0, color: '#7a838d' },
  island: { label: 'Kitchen island', width: 1.8, depth: 0.85, height: 0.92, rotation: 0, color: '#5f6974' },
  plant: { label: 'Plant', width: 0.6, depth: 0.6, height: 1.1, rotation: 0, color: '#5c825d' }
}

export const makeFurniture = (kind: FurnitureKind, x: number, z: number, count: number): FurnitureItem => ({
  id: `${kind}-${Date.now()}-${count}`,
  kind,
  x,
  z,
  ...furnitureDefaults[kind]
})

export const parsePlan = (raw: string): HousePlan => {
  const value = JSON.parse(raw) as Partial<HousePlan>
  if (value.version !== 1 || !Array.isArray(value.rooms) || !Array.isArray(value.furniture)) {
    throw new Error('This file is not a House Planner v1 plan.')
  }
  return value as HousePlan
}
