import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { PersonEvent } from "@/types";
import { ParticipantEventChip } from "./ParticipantEventChip";

const invalidEvent: PersonEvent = {
  id: "m1",
  title: "Follow-up",
  start: "15:00",
  end: null,
  isValid: false,
  invalidReason: "missing_time",
};

describe("ParticipantEventChip", () => {
  it("renders a focusable invalid-reason trigger for invalid events", async () => {
    const user = userEvent.setup();

    render(<ParticipantEventChip event={invalidEvent} />);

    const trigger = screen.getByRole("button", {
      name: "Show invalid event reason",
    });

    expect(trigger).toBeInTheDocument();

    await user.tab();

    expect(trigger).toHaveFocus();
    expect(screen.getByRole("tooltip")).toHaveTextContent(
      "Invalid event: Missing time",
    );
  });
});
