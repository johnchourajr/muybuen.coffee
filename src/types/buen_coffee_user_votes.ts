export interface Buen_coffee_user_votes {
  id: number;
  alias: string;
  user_id: string; // Could be IP, session ID, or user ID
  vote_type: "upvote" | "downvote";
  created: unknown;
  updated: unknown | null;
}
