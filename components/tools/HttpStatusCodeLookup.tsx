'use client';

import { useMemo, useState } from 'react';

interface StatusCode {
  code: number;
  name: string;
  description: string;
  frequency: 'common' | 'occasional' | 'rare';
}

const CATEGORIES = [
  { key: '2xx', label: '2xx Success', min: 200, max: 299 },
  { key: '3xx', label: '3xx Redirection', min: 300, max: 399 },
  { key: '4xx', label: '4xx Client Error', min: 400, max: 499 },
  { key: '5xx', label: '5xx Server Error', min: 500, max: 599 },
];

const STATUS_CODES: StatusCode[] = [
  { code: 200, name: 'OK', description: 'The request succeeded. The most common success response for GET requests.', frequency: 'common' },
  { code: 201, name: 'Created', description: 'The request succeeded and a new resource was created, typically in response to a POST.', frequency: 'common' },
  { code: 202, name: 'Accepted', description: 'The request was accepted for processing, but processing isn\'t complete yet.', frequency: 'occasional' },
  { code: 204, name: 'No Content', description: 'The request succeeded but there\'s no response body to return, common after a DELETE.', frequency: 'common' },
  { code: 206, name: 'Partial Content', description: 'Returns only part of a resource, used for byte-range requests like resumable downloads or video streaming.', frequency: 'occasional' },
  { code: 301, name: 'Moved Permanently', description: 'The resource has permanently moved to a new URL; clients should update their links.', frequency: 'common' },
  { code: 302, name: 'Found', description: 'The resource temporarily lives at a different URL; the original URL should still be used for future requests.', frequency: 'common' },
  { code: 304, name: 'Not Modified', description: 'The cached version of the resource is still valid, so no body is sent - saves bandwidth.', frequency: 'common' },
  { code: 307, name: 'Temporary Redirect', description: 'Like 302, but strictly preserves the original request method (a POST stays a POST).', frequency: 'occasional' },
  { code: 308, name: 'Permanent Redirect', description: 'Like 301, but strictly preserves the original request method.', frequency: 'occasional' },
  { code: 400, name: 'Bad Request', description: 'The server couldn\'t understand the request due to malformed syntax or invalid data.', frequency: 'common' },
  { code: 401, name: 'Unauthorized', description: 'Authentication is required and either missing or invalid - despite the name, this is about authentication, not authorization.', frequency: 'common' },
  { code: 403, name: 'Forbidden', description: 'The server understood the request but refuses to authorize it, regardless of authentication.', frequency: 'common' },
  { code: 404, name: 'Not Found', description: 'The server can\'t find the requested resource. The most widely recognized status code.', frequency: 'common' },
  { code: 405, name: 'Method Not Allowed', description: 'The HTTP method used isn\'t supported for this resource (e.g. POST to a read-only endpoint).', frequency: 'occasional' },
  { code: 408, name: 'Request Timeout', description: 'The server timed out waiting for the request from the client.', frequency: 'rare' },
  { code: 409, name: 'Conflict', description: 'The request conflicts with the current state of the resource, such as an edit conflict.', frequency: 'occasional' },
  { code: 410, name: 'Gone', description: 'The resource is permanently gone and no forwarding address is known - stronger than 404.', frequency: 'rare' },
  { code: 413, name: 'Payload Too Large', description: 'The request body exceeds the server\'s size limit.', frequency: 'occasional' },
  { code: 415, name: 'Unsupported Media Type', description: 'The request body\'s format isn\'t supported by the server for this endpoint.', frequency: 'occasional' },
  { code: 418, name: "I'm a Teapot", description: 'An April Fools\' joke from RFC 2324, occasionally implemented for fun rather than genuine use.', frequency: 'rare' },
  { code: 422, name: 'Unprocessable Entity', description: 'The request is well-formed but contains semantic errors, common in API validation responses.', frequency: 'common' },
  { code: 429, name: 'Too Many Requests', description: 'The client has sent too many requests in a given time window - rate limiting.', frequency: 'common' },
  { code: 500, name: 'Internal Server Error', description: 'A generic catch-all for an unexpected server-side failure.', frequency: 'common' },
  { code: 501, name: 'Not Implemented', description: 'The server doesn\'t support the functionality required to fulfill the request.', frequency: 'rare' },
  { code: 502, name: 'Bad Gateway', description: 'A server acting as a gateway or proxy received an invalid response from an upstream server.', frequency: 'common' },
  { code: 503, name: 'Service Unavailable', description: 'The server is temporarily unable to handle the request, often due to overload or maintenance.', frequency: 'common' },
  { code: 504, name: 'Gateway Timeout', description: 'A gateway or proxy didn\'t get a timely response from an upstream server.', frequency: 'common' },
  { code: 511, name: 'Network Authentication Required', description: 'The client needs to authenticate to gain network access, common on captive portals (like hotel WiFi).', frequency: 'rare' },
];

function categoryFor(code: number) {
  return CATEGORIES.find((c) => code >= c.min && code <= c.max);
}

export default function HttpStatusCodeLookup() {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return STATUS_CODES.filter((s) => {
      if (categoryFilter) {
        const cat = categoryFor(s.code);
        if (cat?.key !== categoryFilter) return false;
      }
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (!String(s.code).includes(q) && !s.name.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [query, categoryFilter]);

  const exactMatch = /^\d{3}$/.test(query.trim()) ? STATUS_CODES.find((s) => s.code === Number(query.trim())) : null;

  return (
    <div>
      <div className="control-row">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by code, name, or keyword (e.g. 404, timeout)..."
          className="mono"
          style={{
            flex: 1,
            minWidth: 200,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-primary)',
            padding: '6px 8px',
          }}
        />
        <button className="icon-btn" onClick={() => setQuery('')}>
          Clear
        </button>
      </div>

      <div className="control-row">
        <button className={`icon-btn ${categoryFilter === null ? 'is-active' : ''}`} onClick={() => setCategoryFilter(null)}>
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            className={`icon-btn ${categoryFilter === c.key ? 'is-active' : ''}`}
            onClick={() => setCategoryFilter(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {exactMatch && (
        <div className="panel" style={{ marginTop: 16, padding: '20px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>
            {exactMatch.code} {exactMatch.name}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', marginTop: 8, lineHeight: 1.6 }}>
            {exactMatch.description}
          </div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 10 }}>
            {exactMatch.frequency === 'common' ? 'Commonly seen' : exactMatch.frequency === 'occasional' ? 'Occasionally seen' : 'Rare / obscure'}
          </div>
        </div>
      )}

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-bar">
          <span>{filtered.length} status code{filtered.length === 1 ? '' : 's'}</span>
        </div>
        <div style={{ padding: '4px 16px' }}>
          {filtered.map((s) => (
            <div
              key={s.code}
              style={{
                display: 'flex',
                gap: 12,
                padding: '10px 0',
                borderBottom: '1px solid var(--border)',
                alignItems: 'baseline',
              }}
            >
              <span className="mono" style={{ fontSize: 15, fontWeight: 700, width: 44, flexShrink: 0 }}>
                {s.code}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{s.description}</div>
              </div>
              <span
                className="mono"
                style={{
                  fontSize: 11,
                  color:
                    s.frequency === 'common' ? 'var(--valid)' : s.frequency === 'occasional' ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                  flexShrink: 0,
                  textTransform: 'uppercase',
                }}
              >
                {s.frequency}
              </span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="mono" style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: '16px 0' }}>
              No status codes match your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
