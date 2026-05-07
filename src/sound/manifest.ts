import type { AudioManifest } from '../types/audio'
import { StingerVariant } from '../types/enums'

export const audioManifest: AudioManifest = {
  stingers: {
    [StingerVariant.PASS]: '/audio/stingers/pass.webm',
    [StingerVariant.FAIL]: '/audio/stingers/fail.webm',
    [StingerVariant.BARELY_PASS]: '/audio/stingers/barely_pass.webm',
    [StingerVariant.BARELY_FAIL]: '/audio/stingers/barely_fail.webm',
    [StingerVariant.BOSS_PASS]: '/audio/stingers/boss_pass.webm',
  },
  sfx: {
    purchase_node: '/audio/sfx/purchase_node.webm',
    purchase_gear: '/audio/sfx/purchase_gear.webm',
    hover: '/audio/sfx/hover.webm',
    click: '/audio/sfx/click.webm',
    typewriter: '/audio/sfx/typewriter.webm',
    codex_unlock: '/audio/sfx/codex_unlock.webm',
    boss_warning: '/audio/sfx/boss_warning.webm',
  },
  music: {
    menu: '/audio/music/menu.webm',
    in_run: '/audio/music/in_run.webm',
    post_run: '/audio/music/post_run.webm',
  },
  sprites: {},
}
