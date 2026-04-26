import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import type { AvailabilityResponse, PersonWithEvents } from "./types";
import { fetchAvailability, fetchPeople } from "./services/api";

vi.mock("./services/api", () => ({
  fetchPeople: vi.fn(),
  fetchAvailability: vi.fn(),
}));

const mockFetchPeople = vi.mocked(fetchPeople);
const mockFetchAvailability = vi.mocked(fetchAvailability);

const people: PersonWithEvents[] = [
  {
    id: "alice",
    name: "Alice Johnson",
    workingHours: { start: "09:00", end: "17:00" },
    events: [],
  },
];

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

const firstResult: AvailabilityResponse = {
  durationMinutes: 60,
  stepMinutes: 15,
  attendees: ["alice"],
  commonWorkingWindow: { start: "10:00", end: "17:00" },
  slots: [{ start: "13:00", end: "14:00" }],
  warnings: [],
};

const secondResult: AvailabilityResponse = {
  ...firstResult,
  slots: [{ start: "14:00", end: "15:00" }],
};

describe("App request lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchPeople.mockResolvedValue(people);
  });

  it("keeps the panel cleared when a cleared request resolves late", async () => {
    const user = userEvent.setup();
    const pending = deferred<AvailabilityResponse>();
    mockFetchAvailability.mockReturnValue(pending.promise);

    render(<App />);

    await user.click(await screen.findByRole("checkbox", { name: /Alice Johnson/i }));
    await user.click(screen.getByRole("button", { name: "Find Slots" }));
    await user.click(screen.getByRole("button", { name: "Clear results" }));

    await act(async () => {
      pending.resolve(firstResult);
      await pending.promise;
    });

    expect(
      screen.getByText("Select participants to view matching slots."),
    ).toBeInTheDocument();
    expect(screen.queryByText("13:00 → 14:00")).not.toBeInTheDocument();
  });

  it("only applies the latest successful submit", async () => {
    const user = userEvent.setup();
    const firstPending = deferred<AvailabilityResponse>();
    const secondPending = deferred<AvailabilityResponse>();

    mockFetchAvailability
      .mockReturnValueOnce(firstPending.promise)
      .mockReturnValueOnce(secondPending.promise);

    render(<App />);

    await user.click(await screen.findByRole("checkbox", { name: /Alice Johnson/i }));
    await user.click(screen.getByRole("button", { name: "Find Slots" }));
    await user.click(screen.getByRole("button", { name: "Clear results" }));
    await user.click(screen.getByRole("button", { name: "Find Slots" }));

    await act(async () => {
      secondPending.resolve(secondResult);
      await secondPending.promise;
    });

    expect(await screen.findByText("14:00 → 15:00")).toBeInTheDocument();

    await act(async () => {
      firstPending.resolve(firstResult);
      await firstPending.promise;
    });

    await waitFor(() => {
      expect(screen.queryByText("13:00 → 14:00")).not.toBeInTheDocument();
    });
  });
});
