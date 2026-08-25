import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { FurnitureItem, HousePlan } from '../types'
import { planBounds } from '../lib/plan'

function box(width: number, height: number, depth: number, color: string, x: number, y: number, z: number) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color, roughness: 0.76, metalness: 0.02 })
  )
  mesh.position.set(x, y, z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

function addFurniture(group: THREE.Group, item: FurnitureItem) {
  const furniture = new THREE.Group()
  furniture.position.set(item.x, 0, item.z)
  furniture.rotation.y = -item.rotation

  if (item.kind === 'sofa') {
    furniture.add(box(item.width, item.height * 0.45, item.depth, item.color, 0, item.height * 0.22, 0))
    furniture.add(box(item.width, item.height * 0.55, item.depth * 0.2, item.color, 0, item.height * 0.68, item.depth * 0.4))
  } else if (item.kind === 'table' || item.kind === 'desk') {
    furniture.add(box(item.width, 0.1, item.depth, item.color, 0, item.height, 0))
    const leg = 0.08
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        furniture.add(box(leg, item.height, leg, item.color, sx * (item.width / 2 - 0.12), item.height / 2, sz * (item.depth / 2 - 0.12)))
      }
    }
  } else if (item.kind === 'bed') {
    furniture.add(box(item.width, 0.18, item.depth, '#8b6f58', 0, 0.12, 0))
    furniture.add(box(item.width * 0.94, item.height * 0.55, item.depth * 0.92, item.color, 0, item.height * 0.38, 0))
  } else if (item.kind === 'plant') {
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(item.width * 0.23, item.width * 0.3, item.height * 0.35, 18),
      new THREE.MeshStandardMaterial({ color: '#8b684e' })
    )
    pot.position.y = item.height * 0.18
    const plant = new THREE.Mesh(
      new THREE.SphereGeometry(item.width * 0.45, 18, 14),
      new THREE.MeshStandardMaterial({ color: item.color })
    )
    plant.position.y = item.height * 0.68
    furniture.add(pot, plant)
  } else {
    furniture.add(box(item.width, item.height, item.depth, item.color, 0, item.height / 2, 0))
  }

  group.add(furniture)
}

type Props = { plan: HousePlan; cutaway: boolean }

export function Plan3D({ plan, cutaway }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#f4f6f8')

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)

    const bounds = planBounds(plan)
    const span = Math.max(bounds.width, bounds.depth, 8)
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(bounds.minX + span * 0.85, span * 1.05, bounds.minZ + span * 1.05)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set((bounds.minX + bounds.maxX) / 2, 0.65, (bounds.minZ + bounds.maxZ) / 2)
    controls.enableDamping = true
    controls.maxPolarAngle = Math.PI / 2.03
    controls.minDistance = 3
    controls.maxDistance = 35

    scene.add(new THREE.HemisphereLight('#ffffff', '#9aa3ad', 1.8))
    const sun = new THREE.DirectionalLight('#ffffff', 2.3)
    sun.position.set(-5, 10, -4)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    scene.add(sun)

    const model = new THREE.Group()
    scene.add(model)
    const wallColor = '#fbfaf7'

    for (const room of plan.rooms) {
      const floor = box(room.width, 0.06, room.depth, room.floor, room.x + room.width / 2, -0.03, room.z + room.depth / 2)
      floor.receiveShadow = true
      model.add(floor)
      const h = cutaway ? Math.min(room.wallHeight, 1.15) : room.wallHeight
      const t = plan.wallThickness
      model.add(
        box(room.width + t, h, t, wallColor, room.x + room.width / 2, h / 2, room.z),
        box(room.width + t, h, t, wallColor, room.x + room.width / 2, h / 2, room.z + room.depth),
        box(t, h, room.depth, wallColor, room.x, h / 2, room.z + room.depth / 2),
        box(t, h, room.depth, wallColor, room.x + room.width, h / 2, room.z + room.depth / 2)
      )
    }

    for (const item of plan.furniture) addFurniture(model, item)

    const gridSize = Math.ceil(span + 6)
    const grid = new THREE.GridHelper(gridSize, gridSize * 2, '#c4cad1', '#e2e6ea')
    grid.position.set((bounds.minX + bounds.maxX) / 2, -0.065, (bounds.minZ + bounds.maxZ) / 2)
    scene.add(grid)

    const resize = () => {
      const width = mount.clientWidth
      const height = Math.max(mount.clientHeight, 300)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(mount)

    let frame = 0
    const animate = () => {
      controls.update()
      renderer.render(scene, camera)
      frame = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      controls.dispose()
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose())
          else object.material.dispose()
        }
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [plan, cutaway])

  return (
    <div className="plan-surface plan-3d" ref={mountRef}>
      <div className="canvas-hint">Drag to orbit • wheel / pinch to zoom • no roof</div>
    </div>
  )
}
