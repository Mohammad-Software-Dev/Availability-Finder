import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PersonWithEvents } from "@/types";
import { ParticipantEventChip } from "./ParticipantEventChip";

type Props = {
  person: PersonWithEvents;
  isSelected: boolean;
  onSelectedChange: (selected: boolean) => void;
};

export function ParticipantRow({
  person,
  isSelected,
  onSelectedChange,
}: Props) {
  const checkboxId = `participant-${person.id}`;

  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2.5",
        isSelected
          ? "border-slate-300 bg-slate-50/60"
          : "border-slate-200 bg-white",
      )}
    >
      <div className="grid gap-2.5 md:grid-cols-[185px_minmax(0,1fr)] md:items-start">
        <Label
          htmlFor={checkboxId}
          className="flex cursor-pointer items-start gap-2.5"
        >
          <Checkbox
            id={checkboxId}
            checked={isSelected}
            onCheckedChange={(checked) =>
              checked === "indeterminate"
                ? undefined
                : onSelectedChange(checked)
            }
          />
          <div className="space-y-0.5">
            <p className="text-[1.05rem] leading-5 font-semibold text-foreground">
              {person.name}
            </p>
            <p className="text-[11px] leading-4 text-muted-foreground">
              Working hours: {person.workingHours.start} →{" "}
              {person.workingHours.end}
            </p>
          </div>
        </Label>

        <div className="flex flex-wrap items-start gap-1.5 sm:gap-2">
          {person.events.length === 0 ? (
            <p className="text-xs text-muted-foreground">No events</p>
          ) : (
            person.events.map((event) => (
              <ParticipantEventChip key={event.id} event={event} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
