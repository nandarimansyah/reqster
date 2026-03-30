import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { HttpRequest, HttpResponseData } from "../types";

export function useRequest() {
  const [response, setResponse] = useState<HttpResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendRequest = async (request: HttpRequest) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    // Build the URL with active query params
    let url = request.url.trim();
    const activeParams = request.queryParams.filter(
      (p) => p.enabled && p.key.trim() !== ""
    );
    if (activeParams.length > 0) {
      const qs = new URLSearchParams(
        activeParams.map((p) => [p.key, p.value])
      ).toString();
      url = url.includes("?") ? `${url}&${qs}` : `${url}?${qs}`;
    }

    const activeHeaders = request.headers
      .filter((h) => h.enabled && h.key.trim() !== "")
      .map((h) => ({ key: h.key, value: h.value }));

    const body =
      request.body.type !== "none" && request.body.content.trim() !== ""
        ? request.body.content
        : null;

    try {
      const result = await invoke<HttpResponseData>("send_request", {
        method: request.method,
        url,
        headers: activeHeaders,
        body,
      });
      setResponse(result);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return { response, loading, error, sendRequest };
}
