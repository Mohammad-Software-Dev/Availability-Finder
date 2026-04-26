import { describe, expect, it, vi } from "vitest";
import { calendarEvents } from "../../data/seed.js";
import { errorHandler } from "../../shared/errors/errorHandler.js";
import { handleGetPeople } from "./people.controller.js";
import { getAllPeople } from "./people.service.js";

describe("getAllPeople", () => {
  it("returns people with working hours and enriched events", () => {
    const data = getAllPeople();

    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        workingHours: expect.objectContaining({
          start: expect.any(String),
          end: expect.any(String),
        }),
        events: expect.any(Array),
      }),
    );
  });

  it("classifies messy events with expected invalid reasons", () => {
    const data = getAllPeople();

    const byId = new Map(
      data.flatMap((person) => person.events.map((event) => [event.id, event])),
    );

    expect(byId.get("m1")).toMatchObject({
      isValid: false,
      invalidReason: "missing_time",
    });
    expect(byId.get("m2")).toMatchObject({
      isValid: false,
      invalidReason: "missing_time",
    });
    expect(byId.get("m3")).toMatchObject({
      isValid: false,
      invalidReason: "invalid_interval",
    });
    expect(byId.get("m4")).toMatchObject({
      isValid: false,
      invalidReason: "outside_working_hours",
    });
    expect(byId.get("m5")).toMatchObject({
      isValid: false,
      invalidReason: "outside_working_hours",
    });
  });

  it("orders valid events by start time and keeps invalid events at the end", () => {
    const bob = getAllPeople().find((person) => person.id === "bob");
    expect(bob).toBeDefined();
    expect(bob?.events.map((event) => event.id)).toEqual([
      "b1",
      "m7",
      "m8",
      "b2",
      "m2",
    ]);
  });

  it("keeps Charlie with one valid event and one invalid event", () => {
    const charlie = getAllPeople().find((person) => person.id === "charlie");
    expect(charlie?.events.map((event) => event.id)).toEqual(["c2", "m3"]);
  });

  it("clips partially overlapping valid events to working hours", () => {
    calendarEvents.push({
      id: "clip-test",
      personId: "alice",
      title: "Early overlap",
      start: "08:00",
      end: "10:00",
    });

    try {
      const alice = getAllPeople().find((person) => person.id === "alice");
      expect(alice?.events.find((event) => event.id === "clip-test")).toEqual({
        id: "clip-test",
        title: "Early overlap",
        start: "09:00",
        end: "10:00",
        isValid: true,
        invalidReason: null,
      });
    } finally {
      calendarEvents.splice(
        calendarEvents.findIndex((event) => event.id === "clip-test"),
        1,
      );
    }
  });
});

describe("people controller", () => {
  it("returns 200 and enriched people payload", () => {
    const req = {} as any;
    let statusCode = 0;
    let jsonBody: unknown;

    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(payload: unknown) {
        jsonBody = payload;
        return this;
      },
    } as any;

    handleGetPeople(req, res, vi.fn());

    expect(statusCode).toBe(200);
    expect(jsonBody).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          workingHours: expect.any(Object),
          events: expect.any(Array),
        }),
      ]),
    );
  });

  it("passes internal errors to the error handler", () => {
    let statusCode = 0;
    let jsonBody: unknown;
    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(payload: unknown) {
        jsonBody = payload;
        return this;
      },
    } as any;

    errorHandler(new Error("boom"), {} as any, res, vi.fn());

    expect(statusCode).toBe(500);
    expect(jsonBody).toEqual({
      message: "Internal server error",
    });
  });
});
