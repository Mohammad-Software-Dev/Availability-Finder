import { cn } from "@/lib/utils";
import type { InvalidReason, PersonEvent } from "@/types";
import { CircleAlert } from "lucide-react";

type Props = {
  event: PersonEvent;
};

function getReasonLabel(reason: InvalidReason | null): string {
  switch (reason) {
    case "missing_time":
      return "Missing time";
    case "invalid_interval":
      return "Invalid interval";
    case "outside_working_hours":
      return "Outside working hours";
    default:
      return "";
  }
}

function formatEventTime(start: string | null, end: string | null): string {
  return `${start ?? "--:--"} → ${end ?? "--:--"}`;
}

export function ParticipantEventChip({ event }: Props) {
  const tooltipId = `event-reason-${event.id}`;

  return (
    <div
      className={cn(
        "group relative inline-flex min-w-0 max-w-full flex-col rounded-[10px] border px-2 py-1 text-xs sm:w-fit",
        event.isValid
          ? "border-sky-200 bg-sky-50/70 text-slate-800"
          : "border-slate-200 bg-slate-50 text-slate-600",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold leading-4 break-words">
          {event.title ?? "Untitled event"}
        </p>
        {!event.isValid && (
          <button
            type="button"
            aria-label="Show invalid event reason"
            aria-describedby={tooltipId}
            className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:text-slate-800 focus-visible:text-slate-800 focus-visible:outline-none"
          >
            <CircleAlert className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <p className="text-[10px] leading-4 text-muted-foreground break-words">
        {formatEventTime(event.start, event.end)}
      </p>
      {!event.isValid && (
        <div
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute -top-8 right-1 z-10 rounded-md bg-slate-900 px-2 py-1 text-[10px] whitespace-nowrap text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        >
          Invalid event: {getReasonLabel(event.invalidReason)}
        </div>
      )}
    </div>
  );
}
