export const SV_MONTHS = [
  "januari", "februari", "mars", "april", "maj", "juni",
  "juli", "augusti", "september", "oktober", "november", "december",
];
export const SV_WEEKDAYS = ["mån", "tis", "ons", "tor", "fre", "lör", "sön"];

export function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatSv(date) {
  return (
    date.toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" }) +
    " " +
    date.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })
  );
}

export function humanizeDuration(start, end) {
  if (!start || !end) return "";
  const ms = end.getTime() - start.getTime();
  if (ms <= 0) return "Ogiltig period";
  const hours = ms / (1000 * 60 * 60);
  if (hours < 24) {
    const h = Math.round(hours) || 1;
    return `${h} ${h === 1 ? "timme" : "timmar"}`;
  }
  const days = Math.round(hours / 24);
  return `${days} ${days === 1 ? "dag" : "dagar"}`;
}

export function isDateBooked(date, bookings) {
  return bookings.some((b) => {
    if (!b.rawStart || !b.rawEnd) return false;
    const start = new Date(b.rawStart);
    const end = new Date(b.rawEnd);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
    return dayStart <= end && dayEnd >= start;
  });
}

export function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function linesToList(str) {
  return (str || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}
