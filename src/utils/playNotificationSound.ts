// utils/playNotificationSound.ts
export function playNotificationSound() {
  const audio = new Audio('/sounds/notification.wav'); // put the file in /public/sounds/
  audio.play().catch((err) => {
    console.warn('Sound playback failed:', err);
  });
}
