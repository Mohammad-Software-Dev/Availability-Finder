import { Interval } from "../../shared/types/common.js";

export type AvailabilityRequest = {
  personIds: string[];
  durationMinutes: number;
  stepMinutes?: number;
};

export type TimeSlot = {
  start: string;
  end: string;
};

export type AvailabilityResponse = {
  durationMinutes: number;
  stepMinutes: number;
  attendees: string[];
  commonWorkingWindow: TimeSlot | null;
  slots: TimeSlot[];
  warnings: string[];
};

export type NormalizedPersonAvailability = {
  personId: string;
  name: string;
  workingHours: Interval;
  busyIntervals: Interval[];
  warnings: string[];
};
