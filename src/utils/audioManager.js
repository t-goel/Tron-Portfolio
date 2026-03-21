import { Howl } from 'howler'

let sound = null

export function initAudio() {
  if (sound) return sound
  sound = new Howl({
    src: ['/audio/background.mp3'],
    loop: true,
    volume: 0,
    autoplay: false,
  })
  return sound
}

export function playWithFade(duration = 2000) {
  const s = initAudio()
  s.play()
  s.seek()
  s.fade(0, 0.3, duration)
}

export function setMuted(muted) {
  if (sound) sound.mute(muted)
}

export function getSound() {
  return sound
}
