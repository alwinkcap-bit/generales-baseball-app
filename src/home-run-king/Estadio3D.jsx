
import { Canvas } from '@react-three/fiber'

function Base({ posicion }) {
  return (
    <mesh position={posicion} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1.3, 1.3]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  )
}

function Estadio() {
  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight
        position={[20, 35, 15]}
        intensity={2}
        castShadow
      />

      {/* Césped */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[110, 80]} />
        <meshStandardMaterial color="#247b38" />
      </mesh>

      {/* Tierra del diamante */}
      <mesh
        position={[0, 0.02, -12]}
        rotation={[-Math.PI / 2, 0, Math.PI / 4]}
        receiveShadow
      >
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial color="#b77b46" />
      </mesh>

      {/* Montículo */}
      <mesh position={[0, 0.25, -19]} castShadow>
        <cylinderGeometry args={[3.5, 4, 0.5, 32]} />
        <meshStandardMaterial color="#ad7446" />
      </mesh>

      {/* Bases */}
      <Base posicion={[0, 0.08, -2]} />
      <Base posicion={[14, 0.08, -12]} />
      <Base posicion={[0, 0.08, -26]} />
      <Base posicion={[-14, 0.08, -12]} />

      {/* Cerca del jardín */}
      {Array.from({ length: 35 }, (_, i) => {
        const angulo = Math.PI * (i / 34)
        const x = Math.cos(angulo) * 85
        const z = -12 - Math.sin(angulo) * 85

        return (
          <mesh key={i} position={[x, 3, z]}>
            <boxGeometry args={[5.5, 6, 0.5]} />
            <meshStandardMaterial color="#153b58" />
          </mesh>
        )
      })}
    </>
  )
}

export default function Estadio3D() {
  return (
    <div style={{
      width: '100%',
      height: '55vh',
      minHeight: 300,
      background: '#87b9e6',
      borderRadius: 15,
      overflow: 'hidden'
    }}>
      <Canvas
        shadows
        camera={{
          position: [0, 12, 17],
          fov: 65
        }}
      >
        <color attach="background" args={['#87b9e6']} />
        <Estadio />
      </Canvas>
    </div>
  )
}
