export function isValidTimeString(value?: string): boolean {
  if (!value) return false;

  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return false;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours < 0 || hours > 23) return false;
  if (minutes < 0 || minutes > 59) return false;

  return true;
}

export function parseTimeToMinutes(value?: string): number | null {
  if (!value) return null;

  if (!isValidTimeString(value)) return null;

  const [hoursStr, minutesStr] = value.split(":");

  return Number(hoursStr) * 60 + Number(minutesStr);
}

export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export function isValidInterval(start: number, end: number): boolean {
  return start < end;
}
