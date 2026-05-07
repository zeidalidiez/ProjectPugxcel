import { Howl } from 'howler'
import type { StingerVariant } from '../types/enums'
import { audioManifest } from './manifest'
import { useGameStore } from '../store'

class AudioEngine {
  private currentMusic: Howl | null = null
  private initialized = false

  init() {
    if (this.initialized) return
    this.initialized = true
  }

  playStinger(variant: StingerVariant) {
    const settings = useGameStore.getState().settings
    if (!settings.soundEnabled) return
    const src = audioManifest.stingers[variant]
    if (!src) return
    const sound = new Howl({ src: [src], volume: settings.soundVolume, onloaderror: () => {} })
    sound.play()
  }

  playSfx(name: string) {
    const settings = useGameStore.getState().settings
    if (!settings.soundEnabled) return
    const src = audioManifest.sfx[name]
    if (!src) return
    const sound = new Howl({ src: [src], volume: settings.soundVolume * 0.6, onloaderror: () => {} })
    sound.play()
  }

  playMusic(track: string) {
    const settings = useGameStore.getState().settings
    if (!settings.musicEnabled) return
    if (this.currentMusic) {
      this.currentMusic.stop()
      this.currentMusic.unload()
      this.currentMusic = null
    }
    const src = audioManifest.music[track]
    if (!src) return
    this.currentMusic = new Howl({
      src: [src],
      volume: settings.musicVolume,
      loop: true,
      onloaderror: () => { this.currentMusic = null },
    })
    this.currentMusic.play()
  }

  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.stop()
      this.currentMusic.unload()
      this.currentMusic = null
    }
  }

  playTypewriterTick() {
    this.playSfx('typewriter')
  }
}

export const audioEngine = new AudioEngine()
