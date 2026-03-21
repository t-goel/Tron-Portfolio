import { Howl } from 'howler'

let sound = null
let started = false

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
  if (started) return
  started = true
  const s = initAudio()
  s.play()
  s.seek(15)
  s.fade(0, 0.15, duration)
}

export function setMuted(muted) {
  if (sound) sound.mute(muted)
}

export function getSound() {
  return sound
}
