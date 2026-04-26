import { calendarEvents, people, SeedPerson } from "../../data/seed.js";
import { AppError } from "../../shared/errors/AppError.js";
import { Interval } from "../../shared/types/common.js";
import {
  clipInterval,
  mergeIntervals,
  findFreeWindows,
  generateSlots,
} from "../../shared/utils/intervals.js";
import {
  formatMinutesToTime,
  isValidInterval,
  parseTimeToMinutes,
} from "../../shared/utils/time.js";
import {
  AvailabilityRequest,
  AvailabilityResponse,
  NormalizedPersonAvailability,
} from "./availability.types.js";

function getDuplicateIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.add(id);
      continue;
    }

    seen.add(id);
  }

  return Array.from(duplicates);
}

export function normalizePersonAvailability(
  person: SeedPerson,
): NormalizedPersonAvailability {
  const warnings: string[] = [];

  // Parse working hours
  const start = parseTimeToMinutes(person.workingHours.start);
  const end = parseTimeToMinutes(person.workingHours.end);

  if (start === null || end === null || !isValidInterval(start, end)) {
    throw new Error(`Invalid working hours for ${person.id}`);
  }

  const workingHours: Interval = { start, end };

  // Get events for this person
  const events = calendarEvents.filter((event) => event.personId === person.id);

  const busyIntervals: Interval[] = [];

  for (const event of events) {
    const start = parseTimeToMinutes(event.start);
    const end = parseTimeToMinutes(event.end);

    // Skip invalid time format
    if (start === null || end === null) {
      warnings.push(
        `${person.name}: skipped invalid event (missing/invalid time)`,
      );
      continue;
    }

    // Skip invalid intervals
    if (!isValidInterval(start, end)) {
      warnings.push(
        `${person.name}: skipped invalid interval (start >= end)`,
      );
      continue;
    }

    const clipped = clipInterval({ start, end }, workingHours);

    // Skip if outside working hours
    if (!clipped) {
      warnings.push(
        `${person.name}: skipped event outside working hours`,
      );
      continue;
    }

    busyIntervals.push(clipped);
  }

  // Merge intervals
  const mergedBusy = mergeIntervals(busyIntervals);

  return {
    personId: person.id,
    name: person.name,
    workingHours,
    busyIntervals: mergedBusy,
    warnings,
  };
}

export function getCommonWorkingWindow(
  people: NormalizedPersonAvailability[],
): Interval | null {
  if (people.length === 0) return null;

  let start = people[0].workingHours.start;
  let end = people[0].workingHours.end;

  for (let i = 1; i < people.length; i++) {
    const current = people[i].workingHours;

    start = Math.max(start, current.start);
    end = Math.min(end, current.end);
  }

  if (start >= end) {
    return null; // no overlap
  }

  return { start, end };
}

export function collectBusyIntervals(
  people: NormalizedPersonAvailability[],
  commonWindow: Interval,
): Interval[] {
  const allBusy: Interval[] = [];

  for (const person of people) {
    for (const interval of person.busyIntervals) {
      const clipped = clipInterval(interval, commonWindow);

      if (clipped) {
        allBusy.push(clipped);
      }
    }
  }
  return mergeIntervals(allBusy);
}

export function getAvailability(
  input: AvailabilityRequest,
): AvailabilityResponse {
  const warningsSet = new Set<string>();
  const stepMinutes = input.stepMinutes ?? 15;
  const { durationMinutes, personIds } = input;
  const normalizedPersonIds = personIds.map((id) => id.trim());

  if (normalizedPersonIds.length === 0) {
    throw new AppError("At least one person must be selected", 400);
  }

  if (normalizedPersonIds.some((id) => id.length === 0)) {
    throw new AppError("Person id cannot be empty", 400);
  }

  const duplicateIds = getDuplicateIds(normalizedPersonIds);
  if (duplicateIds.length > 0) {
    const label = duplicateIds.length === 1 ? "id" : "ids";

    throw new AppError(
      `Duplicate participant ${label} not allowed: ${duplicateIds.join(", ")}`,
      400,
    );
  }

  const selectedPeople = people.filter((p) => normalizedPersonIds.includes(p.id));

  if (selectedPeople.length !== normalizedPersonIds.length) {
    const knownIds = new Set(selectedPeople.map((person) => person.id));
    const missingIds = normalizedPersonIds.filter((id) => !knownIds.has(id));
    const label = missingIds.length === 1 ? "id" : "ids";

    throw new AppError(
      `Unknown participant ${label}: ${missingIds.join(", ")}`,
      400,
    );
  }

  const normalizedPeople = selectedPeople.map((person) => {
    const result = normalizePersonAvailability(person);
    for (const warning of result.warnings) {
      warningsSet.add(warning);
    }
    return result;
  });
  if (normalizedPeople.length === 0) {
    return {
      durationMinutes,
      stepMinutes,
      attendees: normalizedPersonIds,
      commonWorkingWindow: null,
      slots: [],
      warnings: [...warningsSet, "No valid participants available"],
    };
  }

  const commonWindow = getCommonWorkingWindow(normalizedPeople);

  if (!commonWindow) {
    return {
      durationMinutes,
      stepMinutes,
      attendees: normalizedPersonIds,
      commonWorkingWindow: null,
      slots: [],
      warnings: [...warningsSet, "No common working window"],
    };
  }

  const globalBusy = collectBusyIntervals(normalizedPeople, commonWindow);

  const freeWindows = findFreeWindows(globalBusy, commonWindow);

  const slots = generateSlots(freeWindows, durationMinutes, stepMinutes);

  const formattedSlots = slots.map((slot) => ({
    start: formatMinutesToTime(slot.start),
    end: formatMinutesToTime(slot.end),
  }));

  return {
    durationMinutes,
    stepMinutes,
    attendees: normalizedPersonIds,
    commonWorkingWindow: {
      start: formatMinutesToTime(commonWindow.start),
      end: formatMinutesToTime(commonWindow.end),
    },
    slots: formattedSlots,
    warnings: Array.from(warningsSet),
  };
}
