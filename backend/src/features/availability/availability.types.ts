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
