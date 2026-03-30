export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export type BodyType = "none" | "json" | "text" | "form-urlencoded";

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestBody {
  type: BodyType;
  content: string;
}

export interface HttpRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  queryParams: KeyValuePair[];
  headers: KeyValuePair[];
  body: RequestBody;
}

/** Matches the Rust `HttpResponse` struct (serde snake_case) */
export interface HttpResponseData {
  status: number;
  status_text: string;
  headers: Array<{ key: string; value: string }>;
  body: string;
  duration_ms: number;
  size_bytes: number;
}

export interface Collection {
  id: string;
  name: string;
  requests: HttpRequest[];
}
