import { useEffect, useRef, useState } from "react";
import type {
  ApiError,
  AvailabilityRequest,
  AvailabilityResponse,
  PersonWithEvents,
  Status,
} from "./types";
import { fetchAvailability, fetchPeople } from "./services/api";
import { AvailabilityForm } from "./components/AvailabilityForm";
import { AvailabilityResults } from "./components/AvailabilityResults";

function App() {
  const [people, setPeople] = useState<PersonWithEvents[]>([]);
  const [peopleStatus, setPeopleStatus] = useState<Status>("idle");
  const [peopleError, setPeopleError] = useState<ApiError | null>(null);

  const [availability, setAvailability] = useState<AvailabilityResponse | null>(
    null,
  );
  const [availabilityStatus, setAvailabilityStatus] = useState<Status>("idle");
  const [availabilityError, setAvailabilityError] = useState<ApiError | null>(
    null,
  );
  const [lastSubmittedRequest, setLastSubmittedRequest] =
    useState<AvailabilityRequest | null>(null);
  const [availabilityIsStale, setAvailabilityIsStale] = useState(false);
  const availabilityRequestIdRef = useRef(0);
  const availabilityAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    async function loadPeople() {
      setPeopleStatus("loading");
      setPeopleError(null);

      try {
        const data = await fetchPeople();
        setPeople(data);
        setPeopleStatus("success");
      } catch (err) {
        setPeopleStatus("error");
        setPeopleError(err as ApiError);
      }
    }

    loadPeople();
  }, []);

  useEffect(() => {
    return () => {
      availabilityAbortRef.current?.abort();
    };
  }, []);

  async function handleSubmit(payload: AvailabilityRequest) {
    availabilityAbortRef.current?.abort();
    const controller = new AbortController();
    availabilityAbortRef.current = controller;
    const requestId = availabilityRequestIdRef.current + 1;
    availabilityRequestIdRef.current = requestId;

    setAvailabilityStatus("loading");
    setAvailabilityError(null);
    setAvailabilityIsStale(false);
    setLastSubmittedRequest(payload);

    try {
      const data = await fetchAvailability(payload, {
        signal: controller.signal,
      });

      if (requestId !== availabilityRequestIdRef.current) {
        return;
      }

      setAvailability(data);
      setAvailabilityStatus("success");
    } catch (err) {
      if (
        controller.signal.aborted ||
        requestId !== availabilityRequestIdRef.current
      ) {
        return;
      }

      setAvailabilityStatus("error");
      setAvailabilityError(err as ApiError);
    } finally {
      if (requestId === availabilityRequestIdRef.current) {
        availabilityAbortRef.current = null;
      }
    }
  }

  function handleClearResults() {
    availabilityAbortRef.current?.abort();
    availabilityAbortRef.current = null;
    availabilityRequestIdRef.current += 1;
    setAvailability(null);
    setAvailabilityStatus("idle");
    setAvailabilityError(null);
    setLastSubmittedRequest(null);
    setAvailabilityIsStale(false);
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <h1 className="text-3xl leading-tight font-bold sm:text-4xl">
        Availability Finder{" "}
        <span className="mt-1 block text-base font-medium text-muted-foreground sm:mt-0 sm:inline sm:text-lg">
          (One-day view)
        </span>
      </h1>

      {peopleStatus === "loading" && <p>Loading participants...</p>}

      {peopleStatus === "error" && (
        <p className="text-red-500">
          {peopleError?.message ?? "Failed to load participants"}
        </p>
      )}

      {peopleStatus === "success" && people.length === 0 && (
        <p>No participants available</p>
      )}

      {peopleStatus === "success" && people.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <AvailabilityForm
            people={people}
            status={availabilityStatus}
            lastSubmittedRequest={lastSubmittedRequest}
            onDirtyChange={setAvailabilityIsStale}
            onSubmit={handleSubmit}
          />

          <AvailabilityResults
            data={availability}
            status={availabilityStatus}
            error={availabilityError}
            isStale={availabilityIsStale}
            onClear={handleClearResults}
          />
        </div>
      )}
    </div>
  );
}

export default App;
