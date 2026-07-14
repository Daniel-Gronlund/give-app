import { useState } from "react";
import { Clock, ChevronRight } from "lucide-react";
import { SV_MONTHS, SV_WEEKDAYS, sameDay, toISODate, isDateBooked, buildMonthGrid } from "../lib/dates";

/**
 * mode: "view" (read-only) | "range" (pick a start/end day) | "toggle" (owner blocks individual days)
 */
export default function AvailabilityCalendar({
  bookings = [],
  blockedDates = [],
  title = "Lediga tider",
  mode = "view",
  selectedStart = null,
  selectedEnd = null,
  onSelectDay,
  onToggleDay,
  unavailableLabel = "Bokad",
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const cells = buildMonthGrid(cursor.getFullYear(), cursor.getMonth());
  const canGoBack =
    cursor.getFullYear() > today.getFullYear() ||
    (cursor.getFullYear() === today.getFullYear() && cursor.getMonth() > today.getMonth());

  return (
    <div className="rounded-xl p-5 border border-line bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm flex items-center gap-1.5 text-ink">
          <Clock size={14} /> {title}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Föregående månad"
            disabled={!canGoBack}
            onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            className="w-7 h-7 rounded-md flex items-center justify-center border border-line rotate-180 disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
          <span className="text-xs font-medium w-28 text-center capitalize text-ink">
            {SV_MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
          </span>
          <button
            type="button"
            aria-label="Nästa månad"
            onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            className="w-7 h-7 rounded-md flex items-center justify-center border border-line"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {SV_WEEKDAYS.map((w) => (
          <div key={w} className="text-[10px] text-center uppercase tracking-wide text-inkSoft">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const iso = toISODate(date);
          const past = date < today;
          const bookedByOthers = !past && isDateBooked(date, bookings);
          const ownerBlocked = !past && blockedDates.includes(iso);
          const unavailable = bookedByOthers || ownerBlocked;
          const isToday = sameDay(date, today);
          const isStart = mode === "range" && selectedStart === iso;
          const isEnd = mode === "range" && selectedEnd === iso;
          const inRange = mode === "range" && selectedStart && selectedEnd && iso > selectedStart && iso < selectedEnd;
          const clickable = mode === "range" ? !past && !unavailable : mode === "toggle" ? !past : false;

          let classes = "aspect-square rounded-md flex items-center justify-center text-xs relative border-0 ";
          if (isStart || isEnd) classes += "bg-pine text-white font-bold";
          else if (inRange) classes += "bg-pine/25 text-pineDark font-medium";
          else if (past) classes += "text-line";
          else if (unavailable) classes += "bg-terracotta/15 text-terracotta font-medium";
          else classes += "bg-pine/10 text-pineDark font-medium";

          function handleClick() {
            if (!clickable) return;
            if (mode === "range") onSelectDay(iso);
            if (mode === "toggle") onToggleDay(iso);
          }

          return (
            <button
              key={i}
              type="button"
              disabled={!clickable}
              onClick={handleClick}
              className={classes}
              style={{ cursor: clickable ? "pointer" : "default", fontWeight: isToday ? 700 : undefined }}
            >
              {date.getDate()}
              {isToday && !isStart && !isEnd && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-pine" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs flex-wrap text-inkSoft">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm inline-block bg-pine/25" /> Ledig
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm inline-block bg-terracotta/35" /> {unavailableLabel}
        </span>
        {mode === "range" && (
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block bg-pine" /> Vald
          </span>
        )}
      </div>
    </div>
  );
}
