import { describe, expect, it } from 'vitest'
import { DEFAULT_PLAN } from '../defaultPlan'
import { parsePlan, planBounds, roundToGrid } from './plan'

describe('starter plan', () => {
  it('keeps the garage on the mirrored right hand side of the plan', () => {
    const garage = DEFAULT_PLAN.rooms.find((room) => room.id === 'garage')!
    const kitchen = DEFAULT_PLAN.rooms.find((room) => room.id === 'kitchen')!
    expect(garage.x).toBeGreaterThan(kitchen.x + kitchen.width)
  })

  it('has a useful working envelope', () => {
    const bounds = planBounds(DEFAULT_PLAN)
    expect(bounds.width).toBeGreaterThan(7)
    expect(bounds.depth).toBeGreaterThan(8)
  })

  it('snaps values to the selected grid', () => {
    expect(roundToGrid(1.24, 0.5)).toBe(1)
    expect(roundToGrid(1.26, 0.5)).toBe(1.5)
  })

  it('rejects unsupported imported files', () => {
    expect(() => parsePlan('{"version":2,"rooms":[],"furniture":[]}')).toThrow()
  })
})
