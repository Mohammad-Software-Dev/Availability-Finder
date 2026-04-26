import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AvailabilityRequest, PersonWithEvents, Status } from "@/types";
import { FieldHelp } from "./FieldHelp";
import { ParticipantRow } from "./ParticipantRow";

type Props = {
  people: PersonWithEvents[];
  status: Status;
  lastSubmittedRequest: AvailabilityRequest | null;
  onDirtyChange: (isDirty: boolean) => void;
  onSubmit: (payload: AvailabilityRequest) => void;
};

function getPositiveWholeNumberError(
  value: string,
  label: "Duration" | "Step",
): string | null {
  if (!value.trim()) {
    return `${label} must be a positive whole number`;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return `${label} must be a positive whole number`;
  }

  return null;
}

function sortIds(ids: string[]): string[] {
  return [...ids].sort();
}

function areSameSelectedIds(left: string[], right: string[]): boolean {
  return JSON.stringify(sortIds(left)) === JSON.stringify(sortIds(right));
}

function areInputsDirty(
  lastSubmittedRequest: AvailabilityRequest | null,
  nextValues: {
    selectedIds: string[];
    duration: string;
    step: string;
  },
): boolean {
  if (!lastSubmittedRequest) {
    return false;
  }

  const normalizedStep = nextValues.step.trim() === "" ? "" : nextValues.step;

  return (
    !areSameSelectedIds(lastSubmittedRequest.personIds, nextValues.selectedIds) ||
    String(lastSubmittedRequest.durationMinutes) !== nextValues.duration ||
    String(lastSubmittedRequest.stepMinutes ?? 15) !== normalizedStep
  );
}

export function AvailabilityForm({
  people,
  status,
  lastSubmittedRequest,
  onDirtyChange,
  onSubmit,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [duration, setDuration] = useState("60");
  const [step, setStep] = useState("15");

  function setPersonSelected(id: string, selected: boolean) {
    setSelectedIds((prev) => {
      const hasPerson = prev.includes(id);

      if (selected && hasPerson) return prev;
      if (!selected && !hasPerson) return prev;

      return selected ? [...prev, id] : prev.filter((p) => p !== id);
    });
  }

  function selectAllPeople() {
    setSelectedIds(people.map((person) => person.id));
  }

  function clearAllPeople() {
    setSelectedIds([]);
  }

  const durationError = getPositiveWholeNumberError(duration, "Duration");
  const stepError = getPositiveWholeNumberError(step, "Step");

  useEffect(() => {
    onDirtyChange(
      areInputsDirty(lastSubmittedRequest, {
        selectedIds,
        duration,
        step,
      }),
    );
  }, [duration, lastSubmittedRequest, onDirtyChange, selectedIds, step]);

  function validate(): boolean {
    if (selectedIds.length === 0) {
      return false;
    }
    if (durationError || stepError) {
      return false;
    }

    return true;
  }

  function submit() {
    if (!validate()) return;

    onSubmit({
      personIds: selectedIds,
      durationMinutes: Number(duration),
      stepMinutes: step ? Number(step) : undefined,
    });
  }

  const isDisabled =
    status === "loading" ||
    selectedIds.length === 0 ||
    durationError !== null ||
    stepError !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find Availability</CardTitle>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <CardDescription className="text-sm">
            Select participants, then set duration and step.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Label>Participants</Label>
              <div className="flex items-center gap-1 self-start sm:self-auto">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={selectAllPeople}
                >
                  Select all
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={clearAllPeople}
                >
                  Clear all
                </Button>
              </div>
            </div>

            <div className="space-y-2.5">
              {people.map((person) => (
                <ParticipantRow
                  key={person.id}
                  person={person}
                  isSelected={selectedIds.includes(person.id)}
                  onSelectedChange={(selected) =>
                    setPersonSelected(person.id, selected)
                  }
                />
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <span className="text-sm text-muted-foreground">
                  Meeting length
                </span>
              </div>
              <Input
                id="duration"
                type="number"
                min={1}
                step={1}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60"
              />
              {durationError && (
                <p className="text-sm text-red-500">{durationError}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="step">Step (minutes)</Label>
                <FieldHelp
                  details="Start-time interval. Example: 15 checks 10:00, 10:15, 10:30 and so on."
                  className="text-slate-500"
                  detailsClassName="-left-2 top-6 w-64 translate-x-0"
                />
              </div>
              <Input
                id="step"
                type="number"
                min={1}
                step={1}
                value={step}
                onChange={(e) => setStep(e.target.value)}
                placeholder="15"
              />
              {stepError && <p className="text-sm text-red-500">{stepError}</p>}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {selectedIds.length} participant
            {selectedIds.length === 1 ? "" : "s"} selected
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isDisabled}>
              {status === "loading" ? "Finding..." : "Find Slots"}
            </Button>

            {isDisabled && (
              <p className="text-sm text-muted-foreground">
                {selectedIds.length === 0
                  ? "Select at least one participant to continue"
                  : "Enter valid meeting settings"}
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
