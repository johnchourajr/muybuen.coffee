export interface Buen_lists {
  id: number;
  alias: string | null;
  list: "buenlist" | "shitlist" | "blacklist";
  created: Date | null;
}
