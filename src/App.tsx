import { useEffect, useMemo, useRef, useState } from 'react'
import { Plan2D } from './components/Plan2D'
import { Plan3D } from './components/Plan3D'
import { Inspector } from './components/Inspector'
import { makeFurniture, makeRoom, newPlan, parsePlan, planBounds } from './lib/plan'
import type { FurnitureKind, HousePlan, Selection, ViewMode } from './types'
import './styles.css'

const STORAGE_KEY = 'house-planner:v1'

function loadPlan() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? parsePlan(stored) : newPlan()
  } catch {
    return newPlan()
  }
}

const furnitureKinds: { kind: FurnitureKind; label: string }[] = [
  { kind: 'sofa', label: 'Sofa' },
  { kind: 'table', label: 'Table' },
  { kind: 'chair', label: 'Chair' },
  { kind: 'bed', label: 'Bed' },
  { kind: 'desk', label: 'Desk' },
  { kind: 'storage', label: 'Storage' },
  { kind: 'island', label: 'Island' },
  { kind: 'plant', label: 'Plant' }
]

export default function App() {
  const [plan, setPlan] = useState<HousePlan>(loadPlan)
  const [selection, setSelection] = useState<Selection>(null)
  const [view, setView] = useState<ViewMode>('split')
  const [snap, setSnap] = useState(true)
  const [cutaway, setCutaway] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notice, setNotice] = useState('Saved locally')
  const importRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const handle = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan))
      setNotice('Saved locally')
    }, 250)
    setNotice('Saving…')
    return () => window.clearTimeout(handle)
  }, [plan])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!selection) return
      if (event.key.toLowerCase() === 'r' && selection.kind === 'furniture') {
        setPlan((current) => ({
          ...current,
          furniture: current.furniture.map((item) => item.id === selection.id ? { ...item, rotation: item.rotation + Math.PI / 2 } : item)
        }))
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const tag = (event.target as HTMLElement | null)?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        setPlan((current) => ({
          ...current,
          rooms: selection.kind === 'room' ? current.rooms.filter((room) => room.id !== selection.id) : current.rooms,
          furniture: selection.kind === 'furniture' ? current.furniture.filter((item) => item.id !== selection.id) : current.furniture
        }))
        setSelection(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selection])

  const bounds = useMemo(() => planBounds(plan), [plan])

  const addFurniture = (kind: FurnitureKind) => {
    const x = bounds.minX + bounds.width / 2
    const z = bounds.minZ + bounds.depth / 2
    const item = makeFurniture(kind, x, z, plan.furniture.length + 1)
    setPlan({ ...plan, furniture: [...plan.furniture, item] })
    setSelection({ kind: 'furniture', id: item.id })
    setMenuOpen(false)
  }

  const exportPlan = () => {
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${plan.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'house-plan'}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="brand-row">
            <h1>House Planner</h1>
            <span className="reference-badge">Mirrored reference template</span>
          </div>
          <p>Plan the ground floor in 2D, then inspect the same layout in 3D.</p>
        </div>
        <div className="save-state">{notice}</div>
      </header>

      <div className="toolbar" role="toolbar" aria-label="House planner controls">
        <div className="segmented" aria-label="View mode">
          {(['2d', '3d', 'split'] as ViewMode[]).map((mode) => (
            <button key={mode} className={view === mode ? 'active' : ''} onClick={() => setView(mode)}>
              {mode === '2d' ? '2D' : mode === '3d' ? '3D' : 'Split'}
            </button>
          ))}
        </div>

        <button className="primary-button" onClick={() => {
          const room = makeRoom(plan.rooms.length + 1)
          setPlan({ ...plan, rooms: [...plan.rooms, room] })
          setSelection({ kind: 'room', id: room.id })
        }}>+ Room</button>

        <div className="menu-wrap">
          <button className="primary-button" onClick={() => setMenuOpen((open) => !open)}>+ Furniture</button>
          {menuOpen && (
            <div className="popover">
              {furnitureKinds.map(({ kind, label }) => <button key={kind} onClick={() => addFurniture(kind)}>{label}</button>)}
            </div>
          )}
        </div>

        <label className="toggle"><input type="checkbox" checked={snap} onChange={(event) => setSnap(event.target.checked)} />Snap {plan.gridSize}m</label>
        <label className="toggle"><input type="checkbox" checked={cutaway} onChange={(event) => setCutaway(event.target.checked)} />3D cutaway</label>

        <div className="toolbar-spacer" />
        <button className="secondary-button" onClick={exportPlan}>Export</button>
        <button className="secondary-button" onClick={() => importRef.current?.click()}>Import</button>
        <input
          ref={importRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={async (event) => {
            const file = event.target.files?.[0]
            if (!file) return
            try {
              const imported = parsePlan(await file.text())
              setPlan(imported)
              setSelection(null)
              setNotice('Imported')
            } catch (error) {
              window.alert(error instanceof Error ? error.message : 'Unable to import this plan.')
            } finally {
              event.currentTarget.value = ''
            }
          }}
        />
        <button className="secondary-button" onClick={() => {
          if (window.confirm('Reset every room and object to the mirrored starter plan?')) {
            setPlan(newPlan())
            setSelection(null)
          }
        }}>Reset base</button>
      </div>

      <main className={`workspace view-${view}`}>
        <section className="canvas-area">
          {(view === '2d' || view === 'split') && (
            <div className="viewport-pane">
              <div className="pane-title">2D plan</div>
              <Plan2D plan={plan} selection={selection} onSelect={setSelection} onChange={setPlan} snap={snap} />
            </div>
          )}
          {(view === '3d' || view === 'split') && (
            <div className="viewport-pane">
              <div className="pane-title">3D preview</div>
              <Plan3D plan={plan} cutaway={cutaway} />
            </div>
          )}
        </section>
        <Inspector plan={plan} selection={selection} onChange={setPlan} onSelect={setSelection} />
      </main>

      <footer className="statusbar">
        <span>{plan.rooms.length} rooms</span>
        <span>{plan.furniture.length} objects</span>
        <span>{bounds.width.toFixed(1)} × {bounds.depth.toFixed(1)} m working envelope</span>
        <span>Starter geometry is approximate — tune dimensions in the inspector.</span>
      </footer>
    </div>
  )
}
