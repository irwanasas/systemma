import { describe, expect, it } from "vitest";
import { parseNotificationFilter } from "@/features/notifications/filter";

describe("parseNotificationFilter", () => {
  it("keeps valid values", () => {
    expect(parseNotificationFilter({ type: "ORDER_CANCELLED", from: "2025-01-01", to: "2025-01-31", status: "unread" })).toEqual({
      kind: "ORDER_CANCELLED",
      from: "2025-01-01",
      to: "2025-01-31",
      unreadOnly: true,
    });
  });

  it("drops unknown types and invalid dates, and swaps reversed ranges", () => {
    expect(parseNotificationFilter({ type: "DROP TABLE", from: "2025-02-30", to: "x", status: "all" })).toEqual({
      kind: null,
      from: null,
      to: null,
      unreadOnly: false,
    });
    expect(parseNotificationFilter({ from: "2025-03-01", to: "2025-01-01" })).toMatchObject({ from: "2025-01-01", to: "2025-03-01" });
  });
});
