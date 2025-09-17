export type SuggestionState =
  | "pending"
  | "approved"
  | "rejected"
  | "appeal"
  | "final";

export function nextSuggestionState(
  current: SuggestionState,
  action: "approve" | "reject" | "appeal" | "final"
): SuggestionState {
  switch (current) {
    case "pending":
      if (action === "approve") return "approved";
      if (action === "reject") return "rejected";
      break;
    case "rejected":
      if (action === "appeal") return "appeal";
      break;
    case "appeal":
      if (action === "final") return "final";
      break;
    case "approved":
      if (action === "final") return "final";
      break;
  }
  return current;
}
