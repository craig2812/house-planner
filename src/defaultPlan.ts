import type { HousePlan } from './types'

/**
 * Approximate, horizontally mirrored ground-floor interpretation of the
 * reference plan supplied by the user. Measurements visible on the plan are
 * preserved where practical; circulation areas are estimated so the template
 * remains easy to edit.
 */
export const DEFAULT_PLAN: HousePlan = {
  version: 1,
  name: 'Mirrored ground floor',
  wallThickness: 0.12,
  gridSize: 0.5,
  rooms: [
    { id: 'kitchen', name: 'Kitchen', x: 0, z: 0, width: 4.15, depth: 2.47, wallHeight: 2.5, floor: '#efe6d7' },
    { id: 'garage', name: 'Garage', x: 5.48, z: 0, width: 2.42, depth: 4.28, wallHeight: 2.5, floor: '#d8dde4' },
    { id: 'lounge', name: 'Lounge', x: 0, z: 2.47, width: 4.73, depth: 3.15, wallHeight: 2.5, floor: '#ede7de' },
    { id: 'hall', name: 'Hall / stairs', x: 4.73, z: 4.28, width: 1.45, depth: 3.05, wallHeight: 2.5, floor: '#e6e0d7' },
    { id: 'dining', name: 'Dining room', x: 0, z: 5.62, width: 3.37, depth: 3.04, wallHeight: 2.5, floor: '#eee5d8' },
    { id: 'utility', name: 'Utility', x: 3.37, z: 6.08, width: 1.36, depth: 2.08, wallHeight: 2.5, floor: '#e1e5e8' },
    { id: 'cloakroom', name: 'Cloaks / WC', x: 4.73, z: 7.33, width: 1.45, depth: 1.46, wallHeight: 2.5, floor: '#e4e8e9' },
    { id: 'entrance', name: 'Entrance', x: 3.37, z: 8.16, width: 1.36, depth: 0.95, wallHeight: 2.5, floor: '#e6e0d7' }
  ],
  furniture: [
    { id: 'kitchen-island', kind: 'island', label: 'Kitchen island', x: 1.55, z: 1.12, width: 1.7, depth: 0.8, height: 0.92, rotation: 0, color: '#5f6974' },
    { id: 'lounge-sofa', kind: 'sofa', label: 'Sofa', x: 1.25, z: 4.5, width: 2.35, depth: 0.9, height: 0.82, rotation: 0, color: '#6c7a89' },
    { id: 'dining-table', kind: 'table', label: 'Dining table', x: 1.7, z: 7.1, width: 1.8, depth: 0.95, height: 0.76, rotation: 0, color: '#9c7657' },
    { id: 'garage-storage', kind: 'storage', label: 'Garage storage', x: 6.93, z: 0.55, width: 1.8, depth: 0.45, height: 1.9, rotation: 0, color: '#7a838d' }
  ]
}
