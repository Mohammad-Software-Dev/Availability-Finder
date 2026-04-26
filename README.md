# Availability Finder

Availability Finder is a small full-stack TypeScript application for finding shared meeting slots across messy participant calendars. It lets a user inspect participant events, choose meeting settings, and compute overlapping availability within a one-day schedule.

Created by **Mohammad Ahmad**, FullStack Software Engineer.

## Overview

- Full stack: Express backend + React frontend
- Purpose: compute shared meeting availability from messy calendar data
- Scope: one-day scheduling with in-memory seed data

## How to Run

Install dependencies:

```bash
npm run install:all
```

Start both apps:

```bash
npm run dev
```

Run checks:

```bash
npm run build
npm run lint
npm run test
npm run typecheck
```

Automated testing is included for both backend logic and frontend component behavior.

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Scheduling Algorithm

The backend models scheduling as an interval problem.

Each participant contributes:

- a working window
- a set of busy intervals derived from their events

The algorithm pipeline is:

1. Validate the request payload
2. Normalize each participant's availability
3. Reject invalid events with warnings
4. Clip valid events to working hours
5. Merge overlapping or touching busy intervals
6. Intersect participant working windows into one shared working window
7. Subtract merged busy time from that shared window
8. Generate meeting slots using the requested duration and step

At a high level:

```text
free time = common working window - merged busy intervals
```

If each participant working window is `W_i`, then the shared working range is:

```text
W = intersection(W_1, W_2, ... W_n)
```

Complexity is dominated by sorting and merging intervals, so in practice the current implementation behaves like:

```text
O(N log N + S)
```

Where:

- `N` = total number of calendar events considered
- `S` = number of generated candidate slots

The backend scheduling flow is designed so availability can be recalculated incrementally as participants are added or removed, rather than requiring a conceptual redesign of the algorithm. In this project, that live recalculation behavior is intentionally not wired into the UI because request throttling, cancellation policies, and rate limiting were treated as out of scope. The frontend therefore uses an explicit submit flow with `Find Slots` instead of recalculating on every selection change.

## Approach and Design Thinking

I approached this as an end-to-end scheduling problem rather than as a UI-only exercise.

At its core, the project is an interval-based scheduling system: each participant contributes constraints through working hours and calendar events, and the goal is to derive valid meeting slots by combining those constraints in a predictable way.

The implementation follows a transformation pipeline:

- normalize inputs
- merge overlapping busy intervals
- intersect working hours across participants
- subtract busy time from the shared window
- generate candidate meeting slots

This separation keeps the backend logic deterministic, testable, and easier to extend.

From a product perspective, I treated the API as the source of truth and kept the frontend focused on state, UX clarity, and rendering. The goal was not only to compute availability, but also to make the constraints, invalid data, and resulting slots understandable to the user.

Overall, the design prioritizes correctness first, then clarity, then extensibility.

## Backend and Frontend

### Backend

The backend exposes two endpoints:

- `GET /api/people`
- `POST /api/availability`

`GET /api/people` returns participants with:

- identity
- working hours
- display-ready event data
- event validity metadata for UI presentation

Example response:

```json
[
  {
    "id": "alice",
    "name": "Alice Johnson",
    "workingHours": {
      "start": "09:00",
      "end": "17:00"
    },
    "events": [
      {
        "id": "a1",
        "title": "Standup",
        "start": "10:00",
        "end": "10:30",
        "isValid": true,
        "invalidReason": null
      }
    ]
  }
]
```

`POST /api/availability` accepts:

```json
{
  "personIds": ["alice", "bob"],
  "durationMinutes": 60,
  "stepMinutes": 15
}
```

And returns:

```json
{
  "durationMinutes": 60,
  "stepMinutes": 15,
  "attendees": ["alice", "bob"],
  "commonWorkingWindow": {
    "start": "10:00",
    "end": "17:00"
  },
  "slots": [
    { "start": "13:00", "end": "14:00" }
  ],
  "warnings": [
    "Bob Smith: skipped invalid event (missing/invalid time)"
  ]
}
```

Backend responsibilities include:

- validating request shape
- parsing and validating time strings
- classifying invalid events
- merging busy intervals
- computing shared availability
- returning warnings without breaking the full scheduling flow

### Frontend

The frontend is intentionally simple and explicit.

It provides:

- participant selection with `Select all` / `Clear all`
- visible event chips next to each participant
- meeting duration and step inputs
- explicit submit through `Find Slots`
- results, warnings, and stale-result handling

Current frontend behavior:

- invalid events are muted and expose the reason through an invalid-info control
- results are not recalculated automatically on every change
- after a successful search, changing inputs marks results as stale, even if the new values are invalid
- `Clear results` resets the results panel

## Covered Scenarios

- finds shared meeting slots across multiple selected participants
- returns no slots when the requested duration does not fit inside the shared free time
- ignores invalid event data without failing the full availability request
- ignores events that fall outside a participant's working hours
- rejects availability requests that include unknown participant IDs
- shows participant-specific warnings when event data is skipped
- marks previous results as stale after the user changes participants or meeting settings
- supports bulk participant actions through `Select all` and `Clear all`

## Assumptions and Future Improvements

Current assumptions and scope limits:

- one-day view only
- in-memory seed data only
- no recurring events
- all participants are currently assumed to be in the same timezone
- no persisted user data
- explicit submit instead of live recalculation

Future improvements and extensions:

- participant-specific timezone support
- multi-day or date-based scheduling
- recurring event support
- persistent database-backed data
- richer structured warnings instead of plain strings
- debounced automatic recalculation for selection changes
- more advanced UI such as date pickers or calendar views

## Deeper Dive

### Backend structure

```text
backend/src/
  config/        runtime environment loading
  data/          in-memory seed data
  features/
    availability/ scheduling service, schema, controller, tests
    people/       participant and event display service, controller, tests
  shared/
    errors/       app error model and centralized error handler
    types/        shared interval types
    utils/        time and interval helpers
```

Primary backend libraries:

- `express` for HTTP routing
- `zod` for request and environment validation
- `vitest` for unit tests

### Frontend structure

```text
frontend/src/
  components/    form, results, participant rows, event chips, field help
  services/      API client functions
  test/          test setup
  types/         shared frontend API/data types
```

Primary frontend libraries:

- `react` for UI rendering and state
- `vite` for development/build tooling
- `tailwindcss` for styling and responsive layout
- `shadcn` component patterns plus Radix-based primitives for reusable UI building blocks
- `@testing-library/react` and `vitest` for component tests
- `lucide-react` for lightweight icons

### Library usage in practice

- The backend keeps business logic separate from controllers so the scheduling algorithm can be tested directly.
- The frontend keeps API calls in a small service layer and treats the form/results components as view-layer orchestration.
- Shared interval and time utilities on the backend keep the scheduling logic deterministic and easier to reason about.

### Testing

- Backend tests cover scheduling logic, event normalization, warning generation, and controller/error behavior.
- Frontend tests cover form validation, results states, stale-result behavior, and request lifecycle handling.
- Testing is done with `Vitest`, and frontend UI tests use Testing Library.
