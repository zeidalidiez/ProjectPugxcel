import type { StingerVariant } from './enums'

export interface AudioSpriteDef {
  src: string
  sprite: Record<string, [number, number]>
}

export interface AudioManifest {
  stingers: Record<StingerVariant, string>
  sfx: Record<string, string>
  music: Record<string, string>
  sprites: Record<string, AudioSpriteDef>
}
