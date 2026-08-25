import type { HousePlan, Selection } from '../types'

function NumberField({ label, value, min, step = 0.05, onChange }: { label: string; value: number; min?: number; step?: number; onChange: (value: number) => void }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type="number" value={Number(value.toFixed(2))} min={min} step={step} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}

type Props = {
  plan: HousePlan
  selection: Selection
  onChange: (plan: HousePlan) => void
  onSelect: (selection: Selection) => void
}

export function Inspector({ plan, selection, onChange, onSelect }: Props) {
  if (!selection) {
    return (
      <aside className="inspector">
        <div className="inspector-empty">
          <strong>Nothing selected</strong>
          <p>Select a room or object to edit its size, position and appearance.</p>
        </div>
      </aside>
    )
  }

  if (selection.kind === 'room') {
    const room = plan.rooms.find((candidate) => candidate.id === selection.id)
    if (!room) return null
    const patch = (next: Partial<typeof room>) => onChange({
      ...plan,
      rooms: plan.rooms.map((candidate) => candidate.id === room.id ? { ...candidate, ...next } : candidate)
    })

    return (
      <aside className="inspector">
        <div className="inspector-header">
          <span className="eyebrow">Room</span>
          <strong>{room.name}</strong>
        </div>
        <label className="field full"><span>Name</span><input value={room.name} onChange={(event) => patch({ name: event.target.value })} /></label>
        <div className="field-grid">
          <NumberField label="Width (m)" value={room.width} min={0.4} onChange={(width) => patch({ width })} />
          <NumberField label="Depth (m)" value={room.depth} min={0.4} onChange={(depth) => patch({ depth })} />
          <NumberField label="X (m)" value={room.x} onChange={(x) => patch({ x })} />
          <NumberField label="Z (m)" value={room.z} onChange={(z) => patch({ z })} />
          <NumberField label="Wall height" value={room.wallHeight} min={1} onChange={(wallHeight) => patch({ wallHeight })} />
          <label className="field"><span>Floor</span><input type="color" value={room.floor} onChange={(event) => patch({ floor: event.target.value })} /></label>
        </div>
        <button className="danger-button" onClick={() => {
          onChange({ ...plan, rooms: plan.rooms.filter((candidate) => candidate.id !== room.id) })
          onSelect(null)
        }}>Delete room</button>
      </aside>
    )
  }

  const item = plan.furniture.find((candidate) => candidate.id === selection.id)
  if (!item) return null
  const patch = (next: Partial<typeof item>) => onChange({
    ...plan,
    furniture: plan.furniture.map((candidate) => candidate.id === item.id ? { ...candidate, ...next } : candidate)
  })

  return (
    <aside className="inspector">
      <div className="inspector-header">
        <span className="eyebrow">Furniture</span>
        <strong>{item.label}</strong>
      </div>
      <label className="field full"><span>Label</span><input value={item.label} onChange={(event) => patch({ label: event.target.value })} /></label>
      <div className="field-grid">
        <NumberField label="Width (m)" value={item.width} min={0.15} onChange={(width) => patch({ width })} />
        <NumberField label="Depth (m)" value={item.depth} min={0.15} onChange={(depth) => patch({ depth })} />
        <NumberField label="Height (m)" value={item.height} min={0.05} onChange={(height) => patch({ height })} />
        <NumberField label="X (m)" value={item.x} onChange={(x) => patch({ x })} />
        <NumberField label="Z (m)" value={item.z} onChange={(z) => patch({ z })} />
        <NumberField label="Rotation (°)" value={(item.rotation * 180) / Math.PI} step={5} onChange={(degrees) => patch({ rotation: (degrees * Math.PI) / 180 })} />
        <label className="field"><span>Colour</span><input type="color" value={item.color} onChange={(event) => patch({ color: event.target.value })} /></label>
      </div>
      <div className="button-row">
        <button className="secondary-button" onClick={() => patch({ rotation: item.rotation + Math.PI / 2 })}>Rotate 90°</button>
        <button className="danger-button" onClick={() => {
          onChange({ ...plan, furniture: plan.furniture.filter((candidate) => candidate.id !== item.id) })
          onSelect(null)
        }}>Delete</button>
      </div>
    </aside>
  )
}
