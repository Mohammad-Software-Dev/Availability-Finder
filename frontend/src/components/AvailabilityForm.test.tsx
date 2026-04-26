import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { PersonWithEvents } from "@/types";
import { AvailabilityForm } from "./AvailabilityForm";

const people: PersonWithEvents[] = [
  {
    id: "alice",
    name: "Alice Johnson",
    workingHours: { start: "09:00", end: "17:00" },
    events: [
      {
        id: "a1",
        title: "Standup",
        start: "10:00",
        end: "10:30",
        isValid: true,
        invalidReason: null,
      },
    ],
  },
];

describe("AvailabilityForm", () => {
  it("shows the compact form guidance and helper text", () => {
    render(
      <AvailabilityForm
        people={people}
        status="idle"
        lastSubmittedRequest={null}
        onDirtyChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Select participants, then set duration and step."),
    ).toBeInTheDocument();
    expect(screen.getByText("Meeting length")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show field help" })).toBeInTheDocument();
  });

  it("supports select all and clear all participant actions", async () => {
    const user = userEvent.setup();

    render(
      <AvailabilityForm
        people={[
          ...people,
          {
            id: "bob",
            name: "Bob Smith",
            workingHours: { start: "10:00", end: "18:00" },
            events: [],
          },
        ]}
        status="idle"
        lastSubmittedRequest={null}
        onDirtyChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Select all" }));
    expect(screen.getByText("2 participants selected")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear all" }));
    expect(screen.getByText("0 participants selected")).toBeInTheDocument();
  });

  it("blocks submit when step is invalid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <AvailabilityForm
        people={people}
        status="idle"
        lastSubmittedRequest={null}
        onDirtyChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("checkbox", { name: /Alice Johnson/i }));
    const stepInput = screen.getByLabelText("Step (minutes)");
    await user.clear(stepInput);
    await user.type(stepInput, "0");

    expect(
      screen.getByText("Step must be a positive whole number"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Find Slots" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Find Slots" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the expected payload when values are valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <AvailabilityForm
        people={people}
        status="idle"
        lastSubmittedRequest={null}
        onDirtyChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("checkbox", { name: /Alice Johnson/i }));
    await user.click(screen.getByRole("button", { name: "Find Slots" }));

    expect(onSubmit).toHaveBeenCalledWith({
      personIds: ["alice"],
      durationMinutes: 60,
      stepMinutes: 15,
    });
  });

  it("marks results stale when the current selection differs from the last submitted request", async () => {
    const user = userEvent.setup();
    const onDirtyChange = vi.fn();

    render(
      <AvailabilityForm
        people={people}
        status="success"
        lastSubmittedRequest={{
          personIds: ["alice"],
          durationMinutes: 60,
          stepMinutes: 15,
        }}
        onDirtyChange={onDirtyChange}
        onSubmit={vi.fn()}
      />,
    );

    expect(onDirtyChange).toHaveBeenLastCalledWith(true);

    await user.click(screen.getByRole("checkbox", { name: /Alice Johnson/i }));

    expect(onDirtyChange).toHaveBeenLastCalledWith(false);
  });

  it("keeps results stale when a valid submitted field becomes invalid", async () => {
    const user = userEvent.setup();
    const onDirtyChange = vi.fn();

    render(
      <AvailabilityForm
        people={people}
        status="success"
        lastSubmittedRequest={{
          personIds: ["alice"],
          durationMinutes: 60,
          stepMinutes: 15,
        }}
        onDirtyChange={onDirtyChange}
        onSubmit={vi.fn()}
      />,
    );

    const durationInput = screen.getByLabelText("Duration (minutes)");
    await user.clear(durationInput);

    expect(onDirtyChange).toHaveBeenLastCalledWith(true);
    expect(
      screen.getByText("Duration must be a positive whole number"),
    ).toBeInTheDocument();
  });

  it("renders field help as an accessible button trigger", () => {
    render(
      <AvailabilityForm
        people={people}
        status="idle"
        lastSubmittedRequest={null}
        onDirtyChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Show field help" })).toBeInTheDocument();
  });
});
