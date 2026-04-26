export type SeedPerson = {
  id: string;
  name: string;
  workingHours: {
    start: string;
    end: string;
  };
};

export type SeedCalendarEvent = {
  id: string;
  personId: string;
  title?: string;
  start?: string;
  end?: string;
};

export const people: SeedPerson[] = [
  {
    id: "alice",
    name: "Alice Johnson",
    workingHours: { start: "09:00", end: "17:00" },
  },
  {
    id: "bob",
    name: "Bob Smith",
    workingHours: { start: "10:00", end: "18:00" },
  },
  {
    id: "charlie",
    name: "Charlie Brown",
    workingHours: { start: "08:00", end: "16:00" },
  },
  {
    id: "diana",
    name: "Diana Prince",
    workingHours: { start: "09:30", end: "17:30" },
  },
  {
    id: "edward",
    name: "Edward King",
    workingHours: { start: "11:00", end: "19:00" },
  },
  {
    id: "fatima",
    name: "Fatima Rahman",
    workingHours: { start: "08:30", end: "16:30" },
  },
];

export const calendarEvents: SeedCalendarEvent[] = [
  // ---------- Alice ----------
  {
    id: "a1",
    personId: "alice",
    title: "Standup",
    start: "10:00",
    end: "10:30",
  },
  {
    id: "a2",
    personId: "alice",
    title: "Client call",
    start: "14:00",
    end: "15:00",
  },
  {
    id: "a3",
    personId: "alice",
    title: "Handoff",
    start: "15:00",
    end: "15:30",
  },

  // ---------- Bob ----------
  {
    id: "b1",
    personId: "bob",
    title: "Planning",
    start: "11:00",
    end: "12:00",
  },
  {
    id: "b2",
    personId: "bob",
    title: "Design review",
    start: "15:00",
    end: "16:00",
  },

  // ---------- Charlie ----------
  {
    id: "c2",
    personId: "charlie",
    title: "Focus",
    start: "15:00",
    end: "16:00",
  },

  // ---------- Diana ----------
  {
    id: "d1",
    personId: "diana",
    title: "Team sync",
    start: "11:00",
    end: "12:00",
  },
  {
    id: "d2",
    personId: "diana",
    title: "Deep work",
    start: "14:00",
    end: "16:00",
  },

  // ---------- Edward ----------
  {
    id: "e1",
    personId: "edward",
    title: "Onboarding",
    start: "11:30",
    end: "13:00",
  },
  {
    id: "e2",
    personId: "edward",
    title: "Review",
    start: "14:00",
    end: "15:00",
  },

  // ---------- Fatima ----------
  {
    id: "f1",
    personId: "fatima",
    title: "Interviews",
    start: "11:00",
    end: "12:30",
  },
  {
    id: "f2",
    personId: "fatima",
    title: "Check-in",
    start: "14:30",
    end: "15:00",
  },
  {
    id: "f3",
    personId: "fatima",
    title: "Docs",
    start: "15:00",
    end: "16:00",
  },

  // ---------- Messy / Invalid Cases ----------

  // Missing end
  {
    id: "m1",
    personId: "alice",
    title: "Follow-up",
    start: "15:00",
  },

  // Missing start
  {
    id: "m2",
    personId: "bob",
    title: "Update",
    end: "14:00",
  },

  // End before start
  {
    id: "m3",
    personId: "charlie",
    title: "Handoff",
    start: "16:00",
    end: "15:00",
  },

  // Outside working hours
  {
    id: "m4",
    personId: "diana",
    title: "Briefing",
    start: "07:00",
    end: "08:00",
  },

  // Completely outside working hours
  {
    id: "m5",
    personId: "edward",
    title: "Support",
    start: "20:00",
    end: "21:00",
  },

  // Touching events (edge case)
  {
    id: "m7",
    personId: "bob",
    title: "Sync",
    start: "12:00",
    end: "12:30",
  },
  {
    id: "m8",
    personId: "bob",
    title: "Roadmap",
    start: "12:30",
    end: "13:00",
  },

  // Overlapping heavy case
  {
    id: "m10",
    personId: "diana",
    title: "Prep",
    start: "12:00",
    end: "13:00",
  },
];
