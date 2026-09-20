export interface Quote {
  id: number;
  text: string;
  author: string;
}

export interface QuoteRequest {
  text: string;
  author: string;
}
