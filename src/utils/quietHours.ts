export function isInQuietHours(startHour: number, endHour: number, now: Date = new Date()): boolean {
  const currentHour = now.getHours();

  if (startHour > endHour) {
    return currentHour >= startHour || currentHour < endHour;
  }
  return currentHour >= startHour && currentHour < endHour;
}
