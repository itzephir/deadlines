import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { toCreateDeadlineRequest, toDeadline } from "@/api/adapters/deadline";
import { computeDeadlineState } from "@/utils/state";
import { deadline } from "./fixtures";

describe("important dates", () => {
  const now = Date.UTC(2026, 10, 24, 12);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });
  afterEach(() => vi.useRealTimers());

  test("alerts become occurred when their date arrives", () => {
    const alert = { kind: "ALERT", due: now + 1, isCompleted: false } as const;
    expect(computeDeadlineState(alert)).toBe("upcoming");
    vi.setSystemTime(now + 1);
    expect(computeDeadlineState(alert)).toBe("occurred");
  });

  test("past alerts never become overdue or completed", () => {
    expect(computeDeadlineState({ kind: "ALERT", due: now - 1, isCompleted: true })).toBe("occurred");
    expect(computeDeadlineState({ kind: "DEADLINE", due: now - 1, isCompleted: false })).toBe("overdue");
    expect(computeDeadlineState({ kind: "DEADLINE", due: now - 1, isCompleted: true })).toBe("completed");
  });

  test("alert kind survives API serialization and normalization", () => {
    const request = toCreateDeadlineRequest({ kind: "ALERT", title: "Release", due: now, invitations: [] });
    expect(request.kind).toBe("ALERT");
    expect(request.due).toBe("2026-11-24T12:00:00Z");
    expect(toDeadline(deadline({ kind: "ALERT" })).kind).toBe("ALERT");
  });
});
