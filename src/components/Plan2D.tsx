import { useMemo, useRef, useState } from 'react'
import type { HousePlan, Selection } from '../types'
import { planBounds, roundToGrid } from '../lib/plan'

const PADDING = 0.8

function screenToSvg(svg: SVGSVGElement, clientX: number, clientY: number) {
  const point = svg.createSVGPoint()
  point.x = clientX
  point.y = clientY
  const ctm = svg.getScreenCTM()
  if (!ctm) return { x: 0, y: 0 }
  const transformed = point.matrixTransform(ctm.inverse())
  return { x: transformed.x, y: transformed.y }
}

type Props = {
  plan: HousePlan
  selection: Selection
  onSelect: (selection: Selection) => void
  onChange: (plan: HousePlan) => void
  snap: boolean
}

export function Plan2D({ plan, selection, onSelect, onChange, snap }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [drag, setDrag] = useState<{ kind: 'room' | 'furniture'; id: string; offsetX: number; offsetZ: number } | null>(null)

  const bounds = useMemo(() => planBounds(plan), [plan])
  const viewBox = `${bounds.minX - PADDING} ${bounds.minZ - PADDING} ${Math.max(bounds.width + PADDING * 2, 5)} ${Math.max(bounds.depth + PADDING * 2, 5)}`

  const gridLines = useMemo(() => {
    const lines = []
    const startX = Math.floor((bounds.minX - PADDING) / 0.5) * 0.5
    const endX = Math.ceil((bounds.maxX + PADDING) / 0.5) * 0.5
    const startZ = Math.floor((bounds.minZ - PADDING) / 0.5) * 0.5
    const endZ = Math.ceil((bounds.maxZ + PADDING) / 0.5) * 0.5
    for (let x = startX; x <= endX; x += 0.5) {
      const major = Math.abs(x - Math.round(x)) < 0.01
      lines.push(<line key={`gx-${x}`} x1={x} x2={x} y1={startZ} y2={endZ} className={major ? 'grid-major' : 'grid-minor'} />)
    }
    for (let z = startZ; z <= endZ; z += 0.5) {
      const major = Math.abs(z - Math.round(z)) < 0.01
      lines.push(<line key={`gz-${z}`} x1={startX} x2={endX} y1={z} y2={z} className={major ? 'grid-major' : 'grid-minor'} />)
    }
    return lines
  }, [bounds])

  const startRoomDrag = (event: React.PointerEvent<SVGRectElement>, roomId: string, roomX: number, roomZ: number) => {
    event.stopPropagation()
    const svg = svgRef.current
    if (!svg) return
    const point = screenToSvg(svg, event.clientX, event.clientY)
    setDrag({ kind: 'room', id: roomId, offsetX: point.x - roomX, offsetZ: point.y - roomZ })
    onSelect({ kind: 'room', id: roomId })
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const startFurnitureDrag = (event: React.PointerEvent<SVGGElement>, id: string, x: number, z: number) => {
    event.stopPropagation()
    const svg = svgRef.current
    if (!svg) return
    const point = screenToSvg(svg, event.clientX, event.clientY)
    setDrag({ kind: 'furniture', id, offsetX: point.x - x, offsetZ: point.y - z })
    onSelect({ kind: 'furniture', id })
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveDrag = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!drag || !svgRef.current) return
    const point = screenToSvg(svgRef.current, event.clientX, event.clientY)
    const grid = snap ? plan.gridSize : 0.05
    const x = roundToGrid(point.x - drag.offsetX, grid)
    const z = roundToGrid(point.y - drag.offsetZ, grid)

    if (drag.kind === 'room') {
      onChange({ ...plan, rooms: plan.rooms.map((room) => (room.id === drag.id ? { ...room, x, z } : room)) })
    } else {
      onChange({ ...plan, furniture: plan.furniture.map((item) => (item.id === drag.id ? { ...item, x, z } : item)) })
    }
  }

  return (
    <div className="plan-surface plan-2d-wrap">
      <svg
        ref={svgRef}
        className="plan-2d"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        onPointerMove={moveDrag}
        onPointerUp={() => setDrag(null)}
        onPointerCancel={() => setDrag(null)}
        onPointerDown={(event) => { if (event.target === event.currentTarget) onSelect(null) }}
      >
        <g className="grid">{gridLines}</g>
        <g className="rooms">
          {plan.rooms.map((room) => {
            const selected = selection?.kind === 'room' && selection.id === room.id
            return (
              <g key={room.id}>
                <rect
                  x={room.x}
                  y={room.z}
                  width={room.width}
                  height={room.depth}
                  fill={room.floor}
                  className={selected ? 'room selected' : 'room'}
                  onPointerDown={(event) => startRoomDrag(event, room.id, room.x, room.z)}
                />
                <text x={room.x + room.width / 2} y={room.z + room.depth / 2 - 0.12} className="room-label" pointerEvents="none">{room.name}</text>
                <text x={room.x + room.width / 2} y={room.z + room.depth / 2 + 0.23} className="room-dimensions" pointerEvents="none">{room.width.toFixed(2)} × {room.depth.toFixed(2)} m</text>
              </g>
            )
          })}
        </g>
        <g className="furniture">
          {plan.furniture.map((item) => {
            const selected = selection?.kind === 'furniture' && selection.id === item.id
            const degrees = (item.rotation * 180) / Math.PI
            return (
              <g
                key={item.id}
                transform={`translate(${item.x} ${item.z}) rotate(${degrees})`}
                className={selected ? 'furniture-item selected' : 'furniture-item'}
                onPointerDown={(event) => startFurnitureDrag(event, item.id, item.x, item.z)}
              >
                <rect x={-item.width / 2} y={-item.depth / 2} width={item.width} height={item.depth} rx={Math.min(item.width, item.depth) * 0.08} fill={item.color} />
                <text y={0.07} className="furniture-label" pointerEvents="none">{item.label}</text>
              </g>
            )
          })}
        </g>
      </svg>
      <div className="canvas-hint">Drag rooms or furniture • measurements are in metres</div>
    </div>
  )
}
