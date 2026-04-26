export type StyleId = string;

export interface ArtStyle {
  id: StyleId;
  kind: "art";
  creatorId: string;
  creatorName: string;
  title: string;
  pricePerGenerationSats: number;
  description: string;
  styleProfile: {
    visualSummary: string;
    keywords: string[];
    palette: string[];
  };
  referenceImageUrls: string[];
  createdAt: string;
}

export interface WritingStyle {
  id: StyleId;
  kind: "writing";
  creatorId: string;
  creatorName: string;
  title: string;
  pricePerGenerationSats: number;
  description: string;
  styleProfile: {
    proseSummary: string;
    sentenceStructure: string;
    vocabularyLevel: string;
    recurringThemes: string[];
    representativeExcerpts: string[];
  };
  createdAt: string;
}

export type Style = ArtStyle | WritingStyle;

export interface StylesFile {
  styles: Style[];
}

export interface EarningEvent {
  id: string;
  styleId: StyleId;
  creatorId: string;
  amountSats: number;
  paymentHash: string;
  buyerKind: "human" | "agent";
  generationId: string;
  timestamp: string;
}

export interface EarningsFile {
  events: EarningEvent[];
}
