import { useGameStore } from './store'

const phaseComponents: Record<string, React.ComponentType> = {}

export default function App() {
  const phase = useGameStore((s) => s.phase ?? 'archetype_select')
  const Component = phaseComponents[phase]
  return Component ? <Component /> : <div className="h-full flex items-center justify-center text-terminal-text">Loading...</div>
}
