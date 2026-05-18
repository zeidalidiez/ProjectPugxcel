import { useState } from 'react'
import type { BalanceWeights, CurveType, ConstellationLayout } from '../types/balance'
import { BalanceWeightsSchema } from '../types/balance'
import { PRESETS } from '../data/balance-presets'
import { useGameStore } from '../store'

interface CustomDifficultyPanelProps {
  onClose: () => void
}

type WeightKey = Exclude<keyof BalanceWeights, 'curveType' | 'curve' | 'constellationLayout'>

const WEIGHT_FIELDS: { key: WeightKey; label: string; min: number; max: number; step: number }[] = [
  { key: 'bossMultiplier',            label: 'Boss Multiplier',           min: 1.0, max: 5.0, step: 0.05 },
  { key: 'finalBossMultiplier',       label: 'Final Boss Multiplier',     min: 1.0, max: 5.0, step: 0.05 },
  { key: 'itemPowerMultiplier',       label: 'Item Power',                min: 0.1, max: 5.0, step: 0.05 },
  { key: 'nodePowerMultiplier',       label: 'Node Power',                min: 0.1, max: 5.0, step: 0.05 },
  { key: 'startingGoldMultiplier',    label: 'Starting Gold',             min: 0.1, max: 5.0, step: 0.05 },
  { key: 'perTurnPayoutMultiplier',   label: 'Per-Turn Payout',           min: 0.1, max: 5.0, step: 0.05 },
  { key: 'luckEfficacyMultiplier',    label: 'Luck Efficacy',             min: 0.1, max: 5.0, step: 0.05 },
  { key: 'poolSizeMultiplier',        label: 'Store Pool Size',           min: 0.2, max: 2.0, step: 0.05 },
  { key: 'structuralNodeAvailability',label: 'Node Availability',         min: 0.5, max: 2.0, step: 0.05 },
]

const CONSTELLATION_LAYOUTS: { value: ConstellationLayout; label: string }[] = [
  { value: 'radial', label: 'Radial (center-out)' },
  { value: 'left-to-right', label: 'Left-to-Right' },
]

const CONSTELLATION_FIELDS: { key: 'nodeDensity' | 'ringCount' | 'ringZeroNodes'; label: string; min: number; max: number; step: number }[] = [
  { key: 'nodeDensity',  label: 'Node Density',      min: 0.2, max: 5.0, step: 0.1 },
  { key: 'ringCount',    label: 'Ring Count',         min: 4,   max: 10,  step: 1 },
  { key: 'ringZeroNodes',label: 'Ring 0 Nodes',       min: 1,   max: 5,   step: 1 },
]

const CURVE_TYPES: CurveType[] = ['linear', 'breakpoint', 'quadratic']

export default function CustomDifficultyPanel({ onClose }: CustomDifficultyPanelProps) {
  const setDifficulty = useGameStore((s) => s.setDifficulty)
  const lastCustomWeights = useGameStore((s) => s.lastCustomWeights)

  const [weights, setWeights] = useState<BalanceWeights>(
    lastCustomWeights ?? { ...PRESETS.normal }
  )
  const [validationError, setValidationError] = useState<string | null>(null)

  function updateWeight(key: WeightKey, value: number) {
    setWeights((prev) => ({ ...prev, [key]: value }))
    setValidationError(null)
  }

  function updateCurveType(ct: CurveType) {
    setWeights((prev) => ({
      ...prev,
      curveType: ct,
      curve: ct === 'linear'
        ? { base: prev.curve.base, primarySlope: prev.curve.primarySlope }
        : ct === 'breakpoint'
        ? { base: prev.curve.base, primarySlope: prev.curve.primarySlope, secondarySlope: prev.curve.secondarySlope ?? prev.curve.primarySlope * 1.5, breakpointTurn: prev.curve.breakpointTurn ?? 9 }
        : { base: prev.curve.base, primarySlope: prev.curve.primarySlope, quadraticCoeff: prev.curve.quadraticCoeff ?? 0.3 },
    }))
    setValidationError(null)
  }

  function updateCurveField(field: keyof BalanceWeights['curve'], value: number) {
    setWeights((prev) => ({ ...prev, curve: { ...prev.curve, [field]: value } }))
    setValidationError(null)
  }

  function handleApply() {
    const result = BalanceWeightsSchema.safeParse(weights)
    if (!result.success) {
      setValidationError('Invalid weights — check values are in range.')
      return
    }
    setDifficulty('custom', weights)
    onClose()
  }

  function handleReset() {
    setWeights({ ...PRESETS.normal })
    setValidationError(null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="bg-terminal-surface border border-terminal-accent rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-terminal-text-bright text-lg font-bold mb-4 tracking-wider">
          CUSTOM DIFFICULTY
        </h2>

        <div className="mb-4">
          <div className="text-terminal-text text-xs uppercase tracking-widest mb-2">Curve Type</div>
          <div className="flex gap-2">
            {CURVE_TYPES.map((ct) => (
              <button
                key={ct}
                onClick={() => updateCurveType(ct)}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                  weights.curveType === ct
                    ? 'bg-terminal-accent text-black font-bold'
                    : 'border border-terminal-border text-terminal-text hover:border-terminal-accent'
                }`}
                aria-pressed={weights.curveType === ct}
              >
                {ct}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="text-terminal-text text-xs uppercase tracking-widest block mb-1">
              Base
            </label>
            <input
              type="number"
              value={weights.curve.base}
              onChange={(e) => updateCurveField('base', Number(e.target.value))}
              step={1}
              min={1}
              max={100}
              className="w-full px-2 py-1 rounded border border-terminal-border bg-terminal-bg text-terminal-text-bright text-xs font-mono outline-none focus:border-terminal-accent"
              aria-label="Curve base value"
            />
          </div>
          <div>
            <label className="text-terminal-text text-xs uppercase tracking-widest block mb-1">
              Primary Slope
            </label>
            <input
              type="number"
              value={weights.curve.primarySlope}
              onChange={(e) => updateCurveField('primarySlope', Number(e.target.value))}
              step={0.5}
              min={0}
              max={50}
              className="w-full px-2 py-1 rounded border border-terminal-border bg-terminal-bg text-terminal-text-bright text-xs font-mono outline-none focus:border-terminal-accent"
              aria-label="Primary slope"
            />
          </div>
          {weights.curveType === 'breakpoint' && (
            <>
              <div>
                <label className="text-terminal-text text-xs uppercase tracking-widest block mb-1">
                  Secondary Slope
                </label>
                <input
                  type="number"
                  value={weights.curve.secondarySlope ?? 0}
                  onChange={(e) => updateCurveField('secondarySlope', Number(e.target.value))}
                  step={0.5}
                  min={0}
                  max={50}
                  className="w-full px-2 py-1 rounded border border-terminal-border bg-terminal-bg text-terminal-text-bright text-xs font-mono outline-none focus:border-terminal-accent"
                  aria-label="Secondary slope"
                />
              </div>
              <div>
                <label className="text-terminal-text text-xs uppercase tracking-widest block mb-1">
                  Breakpoint Turn
                </label>
                <input
                  type="number"
                  value={weights.curve.breakpointTurn ?? 9}
                  onChange={(e) => updateCurveField('breakpointTurn', Number(e.target.value))}
                  step={1}
                  min={1}
                  max={19}
                  className="w-full px-2 py-1 rounded border border-terminal-border bg-terminal-bg text-terminal-text-bright text-xs font-mono outline-none focus:border-terminal-accent"
                  aria-label="Breakpoint turn"
                />
              </div>
            </>
          )}
          {weights.curveType === 'quadratic' && (
            <div>
              <label className="text-terminal-text text-xs uppercase tracking-widest block mb-1">
                Quadratic Coeff
              </label>
              <input
                type="number"
                value={weights.curve.quadraticCoeff ?? 0.3}
                onChange={(e) => updateCurveField('quadraticCoeff', Number(e.target.value))}
                step={0.05}
                min={0}
                max={5}
                className="w-full px-2 py-1 rounded border border-terminal-border bg-terminal-bg text-terminal-text-bright text-xs font-mono outline-none focus:border-terminal-accent"
                aria-label="Quadratic coefficient"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 mb-5">
          {WEIGHT_FIELDS.map(({ key, label, min, max, step }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <label
                htmlFor={`weight-${key}`}
                className="text-terminal-text text-xs flex-1"
              >
                {label}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={`weight-${key}`}
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={weights[key] as number}
                  onChange={(e) => updateWeight(key, Number(e.target.value))}
                  className="w-28 accent-terminal-accent"
                  aria-label={label}
                />
                <span className="text-terminal-text-bright text-xs font-mono w-10 text-right">
                  {(weights[key] as number).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <div className="text-terminal-text text-xs uppercase tracking-widest mb-2">Constellation Layout</div>
          <div className="flex gap-2">
            {CONSTELLATION_LAYOUTS.map((cl) => (
              <button
                key={cl.value}
                onClick={() => setWeights((prev) => ({ ...prev, constellationLayout: cl.value }))}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                  weights.constellationLayout === cl.value
                    ? 'bg-terminal-accent text-black font-bold'
                    : 'border border-terminal-border text-terminal-text hover:border-terminal-accent'
                }`}
                aria-pressed={weights.constellationLayout === cl.value}
              >
                {cl.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-5">
          {CONSTELLATION_FIELDS.map(({ key, label, min, max, step }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <label htmlFor={`const-${key}`} className="text-terminal-text text-xs flex-1">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  id={`const-${key}`}
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={weights[key] as number}
                  onChange={(e) => updateWeight(key, Number(e.target.value))}
                  className="w-28 accent-terminal-accent"
                  aria-label={label}
                />
                <span className="text-terminal-text-bright text-xs font-mono w-10 text-right">
                  {key === 'nodeDensity' ? (weights[key] as number).toFixed(1) : String(weights[key])}
                </span>
              </div>
            </div>
          ))}
        </div>

        {validationError && (
          <p className="text-terminal-fail text-xs mb-3">{validationError}</p>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleApply}
            className="flex-1 py-2 rounded bg-terminal-accent text-black text-sm font-bold hover:bg-terminal-accent/80 transition-colors"
          >
            Apply
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded border border-terminal-border text-terminal-text text-sm hover:border-terminal-accent transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-terminal-border text-terminal-text text-sm hover:border-terminal-accent transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
