export interface ClickLog {
  clickedAt: string;
  type: "earned" | "spent";
  location: string | null;
}

export interface GamanMetadata {
  gCoins: number;
  clickHistory: ClickLog[];
}
