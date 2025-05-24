export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}`;
}
