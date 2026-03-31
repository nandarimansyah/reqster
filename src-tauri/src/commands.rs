use std::time::Instant;

use reqwest::header::{HeaderMap, HeaderName, HeaderValue};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct HttpHeader {
    pub key: String,
    pub value: String,
}

#[derive(Debug, Serialize)]
pub struct HttpResponse {
    pub status: u16,
    pub status_text: String,
    pub headers: Vec<HttpHeader>,
    pub body: String,
    pub duration_ms: u64,
    pub size_bytes: usize,
}

/// Send an HTTP request and return the response.
///
/// Called from the frontend via `invoke('send_request', { ... })`.
#[tauri::command]
pub async fn send_request(
    method: String,
    url: String,
    headers: Vec<HttpHeader>,
    body: Option<String>,
) -> Result<HttpResponse, String> {
    let client = reqwest::Client::builder()
        .build()
        .map_err(|e| e.to_string())?;

    let method =
        reqwest::Method::from_bytes(method.as_bytes()).map_err(|e| e.to_string())?;

    let mut header_map = HeaderMap::new();
    for h in &headers {
        if !h.key.trim().is_empty() && !h.value.trim().is_empty() {
            let name =
                HeaderName::from_bytes(h.key.trim().as_bytes()).map_err(|e| e.to_string())?;
            let value =
                HeaderValue::from_str(h.value.trim()).map_err(|e| e.to_string())?;
            header_map.insert(name, value);
        }
    }

    let mut req = client.request(method, &url).headers(header_map);

    if let Some(b) = body {
        if !b.is_empty() {
            req = req.body(b);
        }
    }

    let start = Instant::now();
    let response = req.send().await.map_err(|e| e.to_string())?;
    let duration_ms = start.elapsed().as_millis() as u64;

    let status = response.status();
    let status_text = status.canonical_reason().unwrap_or("Unknown").to_string();
    let status_code = status.as_u16();

    let resp_headers: Vec<HttpHeader> = response
        .headers()
        .iter()
        .map(|(k, v)| HttpHeader {
            key: k.as_str().to_string(),
            value: v.to_str().unwrap_or("").to_string(),
        })
        .collect();

    let body_bytes = response.bytes().await.map_err(|e| e.to_string())?;
    let size_bytes = body_bytes.len();
    let body_str = String::from_utf8_lossy(&body_bytes).to_string();

    Ok(HttpResponse {
        status: status_code,
        status_text,
        headers: resp_headers,
        body: body_str,
        duration_ms,
        size_bytes,
    })
}
