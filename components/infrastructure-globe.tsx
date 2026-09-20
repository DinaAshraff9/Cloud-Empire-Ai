'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei'
import * as THREE from 'three'

export type GlobeServer = { id: string; name: string; region: string; status: string; cpu?: number }

const regionCoordinates: Record<string, [number, number]> = {
  'us-east-1': [40.71, -74], 'eu-west-1': [51.5, -0.1], 'me-central-1': [25.2, 55.3], 'ap-southeast-1': [1.35, 103.8], 'sa-east-1': [-23.5, -46.6],
}

const locations = [
  { name: 'New York', lat: 40.71, lon: -74.0, color: '#35d7c8', status: 'Healthy', labelOffset: [0.08, 0.08, 0] as [number, number, number] },
  { name: 'London', lat: 51.5, lon: -0.1, color: '#35d7c8', status: 'Healthy', labelOffset: [0.36, 0.22, 0] as [number, number, number] },
  { name: 'Dubai', lat: 25.2, lon: 55.3, color: '#ad8cff', status: 'Deploying', labelOffset: [0.08, 0.08, 0] as [number, number, number] },
  { name: 'Singapore', lat: 1.35, lon: 103.8, color: '#35d7c8', status: 'Healthy', labelOffset: [0.08, 0.08, 0] as [number, number, number] },
  { name: 'São Paulo', lat: -23.5, lon: -46.6, color: '#35d7c8', status: 'Healthy', labelOffset: [0.08, -0.14, 0] as [number, number, number] },
]

function pointOnSphere(lat: number, lon: number, radius = 1.55) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

function Arc({ from, to, color }: { from: THREE.Vector3; to: THREE.Vector3; color: string }) {
  const curve = useMemo(() => {
    const mid = from.clone().add(to).multiplyScalar(0.5).normalize().multiplyScalar(1.95)
    return new THREE.QuadraticBezierCurve3(from, mid, to)
  }, [from, to])
  const points = useMemo(() => curve.getPoints(48), [curve])
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])
  return <lineSegments geometry={geometry}><lineBasicMaterial color={color} transparent opacity={0.7} /></lineSegments>
}

function GlobeScene({ activeLocations }: { activeLocations: Array<{ name: string; lat: number; lon: number; color: string; status: string; labelOffset: [number, number, number] }> }) {
  const group = useRef<THREE.Group>(null)
  const anchors = useMemo(() => activeLocations.map((location) => pointOnSphere(location.lat, location.lon)), [])
  const cityLights = useMemo(() => Array.from({ length: 180 }, (_, index) => {
    const lat = -55 + ((index * 37) % 110)
    const lon = -178 + ((index * 71) % 356)
    return pointOnSphere(lat, lon, 1.575)
  }), [])
  const lightGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(cityLights.flatMap((point) => point.toArray()), 3))
    return geometry
  }, [cityLights])
  useFrame((_, delta) => { if (group.current) group.current.rotation.y += delta * 0.035 })

  return <>
    <PerspectiveCamera makeDefault position={[0, 0.08, 5.1]} fov={36} />
    <ambientLight intensity={0.7} />
    <pointLight position={[3, 2, 4]} intensity={6} color="#5bd8ff" />
    <pointLight position={[-3, -1, 2]} intensity={2.2} color="#3155ff" />
    <Stars radius={70} depth={28} count={1100} factor={1.7} saturation={0} fade speed={0.15} />
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[1.55, 96, 64]} />
        <meshPhongMaterial color="#071b38" shininess={12} specular="#1b70bd" emissive="#030e24" emissiveIntensity={0.8} />
      </mesh>
      <points geometry={lightGeometry}>
        <pointsMaterial color="#ffc76b" size={0.026} sizeAttenuation transparent opacity={0.92} blending={THREE.AdditiveBlending} />
      </points>
      <mesh>
        <sphereGeometry args={[1.565, 48, 32]} />
        <meshBasicMaterial color="#197bc2" wireframe transparent opacity={0.12} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.59, 64, 64]} />
        <meshBasicMaterial color="#24bfff" transparent opacity={0.2} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
      </mesh>
      {anchors.map((anchor, index) => <group key={`marker-${activeLocations[index].name}`} position={anchor}>
        <mesh><sphereGeometry args={[0.052, 18, 18]} /><meshBasicMaterial color={activeLocations[index].color} /></mesh>
        <mesh scale={1.8}><sphereGeometry args={[0.052, 18, 18]} /><meshBasicMaterial color={activeLocations[index].color} transparent opacity={0.18} side={THREE.BackSide} /></mesh>
        <Html distanceFactor={6.2} position={activeLocations[index].labelOffset} center occlude={false}>
          <div className="globe-city-label" style={{ '--city-color': activeLocations[index].color } as React.CSSProperties}>
            <strong>{activeLocations[index].name}</strong>
            <span><i />{activeLocations[index].status}</span>
          </div>
        </Html>
      </group>)}
      <Html distanceFactor={4.8} position={[0, 0, 1.66]} center>
        <div className="globe-city-label globe-city-label-center" aria-hidden="true"><span>GLOBAL NETWORK</span></div>
      </Html>
      <Arc from={anchors[0]} to={anchors[1]} color="#19cfff" />
      <Arc from={anchors[1]} to={anchors[2]} color="#8c63ff" />
      <Arc from={anchors[2]} to={anchors[3]} color="#8c63ff" />
      <Arc from={anchors[0]} to={anchors[4]} color="#19cfff" />
    </group>
    <OrbitControls enablePan={false} enableZoom={false} autoRotate={false} minPolarAngle={1.16} maxPolarAngle={1.98} />
  </>
}

export function InfrastructureGlobe({ servers = [] }: { servers?: GlobeServer[] }) {
  const [publishedServers, setPublishedServers] = useState<GlobeServer[]>(servers)
  useEffect(() => {
    setPublishedServers(servers)
  }, [servers])
  useEffect(() => {
    const handleDeployment = (event: Event) => {
      const detail = (event as CustomEvent<GlobeServer>).detail
      setPublishedServers((current) => current.some((server) => server.id === detail.id) ? current.map((server) => server.id === detail.id ? detail : server) : [detail, ...current])
    }
    window.addEventListener('cloud:deployment-created', handleDeployment)
    return () => window.removeEventListener('cloud:deployment-created', handleDeployment)
  }, [])
  const dynamicLocations = publishedServers.map((server, index) => {
    const [lat, lon] = regionCoordinates[server.region] ?? [25.2 + index * 3, 55.3 + index * 4]
    const isDeploying = server.status.toLowerCase().includes('deploy') || server.status.toLowerCase().includes('queue')
    return { name: server.name, lat, lon, color: isDeploying ? '#ad8cff' : '#35d7c8', status: isDeploying ? 'Deploying' : 'Healthy', labelOffset: [0.08, 0.08, 0] as [number, number, number] }
  })
  const mapLocations = dynamicLocations.length ? [...dynamicLocations, ...locations].slice(0, Math.max(5, dynamicLocations.length)) : locations
  return <section className="globe-panel panel" aria-labelledby="globe-title">
    <div className="globe-panel-header">
      <div><span className="eyebrow"><span className="live-pulse" />Live topology</span><h2 id="globe-title">Global infrastructure</h2><p>{mapLocations.length} active deployment servers · local workspace</p></div>
      <div className="globe-legend"><span><i className="legend-teal" />Healthy</span><span><i className="legend-purple" />Deploying</span></div>
    </div>
    <div className="globe-stage"><Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}><GlobeScene activeLocations={mapLocations} /></Canvas><div className="globe-callout globe-callout-dubai"><strong>Dubai Server 01</strong><span><i />Deploying · 42% CPU</span></div></div>
    <div className="globe-footer"><span>Drag to explore topology</span><button type="button">Open full map <span aria-hidden="true">→</span></button></div>
  </section>
}

export default InfrastructureGlobe
