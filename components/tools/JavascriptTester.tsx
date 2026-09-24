'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const SAMPLE = `function fib(n) {
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}

console.log('fib(10) =', fib(10));
console.warn('this is a warning');

try {
  null.foo;
} catch (e) {
  console.error('caught:', e.message);
}`;

const CONSOLE_MESSAGE_SOURCE = 'formatiq-js-tester';

// Runs entirely inside a sandboxed iframe with sandbox="allow-scripts" and
// deliberately NO "allow-same-origin". That combination gives the iframe an
// opaque origin: the pasted code can execute, but the browser blocks it from
// reaching this page's DOM, cookies, or localStorage, and from navigating the
// parent - because it has no origin that matches anything to be granted
// access to. console.* calls are relayed out via postMessage, which is the
// only channel a script inside an opaque-origin sandboxed iframe has back to
// the parent page.
function buildSrcDoc(userCode: string): string {
  const escapedCode = JSON.stringify(userCode);
  return `<!DOCTYPE html>
<html><head></head><body>
<script>
(function () {
  function serialize(arg) {
    if (typeof arg === 'string') return arg;
    if (arg instanceof Error) return arg.message;
    try {
      return JSON.stringify(arg, null, 2);
    } catch (e) {
      try {
        return String(arg);
      } catch (e2) {
        return '[unserializable value]';
      }
    }
  }
  function send(level, args) {
    try {
      window.parent.postMessage(
        { source: '${CONSOLE_MESSAGE_SOURCE}', level: level, args: args.map(serialize) },
        '*'
      );
    } catch (e) {}
  }
  ['log', 'warn', 'error', 'info'].forEach(function (level) {
    console[level] = function () {
      send(level, Array.prototype.slice.call(arguments));
    };
  });
  window.addEventListener('error', function (e) {
    send('error', [e.message + (e.lineno ? ' (line ' + e.lineno + ')' : '')]);
    e.preventDefault();
  });
  window.addEventListener('unhandledrejection', function (e) {
    send('error', ['Unhandled promise rejection: ' + (e.reason && e.reason.message ? e.reason.message : e.reason)]);
  });

  var userCode = ${escapedCode};
  try {
    // eslint-disable-next-line no-new-func
    new Function(userCode)();
  } catch (err) {
    send('error', [err && err.message ? err.message : String(err)]);
  }
  window.parent.postMessage({ source: '${CONSOLE_MESSAGE_SOURCE}', level: 'done' }, '*');
})();
</script>
</body></html>`;
}

interface ConsoleEntry {
  level: 'log' | 'warn' | 'error' | 'info';
  text: string;
}

export default function JavascriptTester() {
  const [input, setInput] = useState(SAMPLE);
  const [runKey, setRunKey] = useState(0);
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const [running, setRunning] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- runKey intentionally forces a rebuild of srcDoc on each Run click, even when input hasn't changed
  const srcDoc = useMemo(() => buildSrcDoc(input), [input, runKey]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Sandboxed iframes without allow-same-origin report their origin as
      // the string "null", so origin can't be trusted - only the message's
      // source window (compared against the specific iframe we rendered) can.
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) return;
      if (!event.data || event.data.source !== CONSOLE_MESSAGE_SOURCE) return;
      if (event.data.level === 'done') {
        setRunning(false);
        return;
      }
      setEntries((prev) => [...prev.slice(-199), { level: event.data.level, text: event.data.args.join(' ') }]);
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  function run() {
    setEntries([]);
    setRunning(true);
    setRunKey((k) => k + 1);
  }

  function copyConsole() {
    navigator.clipboard.writeText(entries.map((e) => `[${e.level}] ${e.text}`).join('\n'));
  }

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setInput(SAMPLE)}>
          Load sample
        </button>
        <button className="icon-btn" onClick={run}>
          {running ? 'Running…' : 'Run code'}
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>JavaScript</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={() => setInput('')}>
                Clear
              </button>
            </div>
          </div>
          <textarea
            className="mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Paste JavaScript here, then click Run code..."
          />
          <div className="status-line status-neutral">
            Runs in a sandboxed iframe (sandbox=&quot;allow-scripts&quot;, no allow-same-origin) - it can&apos;t reach this
            page, your cookies, or storage.
          </div>
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Console output ({entries.length})</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={copyConsole} disabled={entries.length === 0}>
                Copy
              </button>
            </div>
          </div>
          <div className="output mono" style={{ overflowY: 'auto' }}>
            {entries.length === 0
              ? '// Click "Run code" to execute your JavaScript and see console.log/warn/error output here'
              : entries.map((entry, i) => (
                  <div
                    key={i}
                    style={{
                      color:
                        entry.level === 'error'
                          ? 'var(--invalid)'
                          : entry.level === 'warn'
                          ? 'var(--accent)'
                          : 'var(--text-primary)',
                    }}
                  >
                    [{entry.level}] {entry.text}
                  </div>
                ))}
          </div>
        </div>
      </div>

      {/* Hidden execution sandbox, only mounted once "Run code" is clicked so
          nothing executes on page load. key={runKey} forces a fresh iframe (and
          fresh global state) on every run, so one run can't leak into the next. */}
      {runKey > 0 && (
        <iframe
          key={runKey}
          ref={iframeRef}
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          style={{ display: 'none' }}
          title="JavaScript execution sandbox"
        />
      )}

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Just checking for a syntax error without running anything? Use the{' '}
        <a href="/tools/validators/javascript-validator">JavaScript Validator</a> instead. Need to reformat the code
        first? Try the <a href="/tools/formatters/js-formatter">JavaScript Formatter</a>.
      </div>
    </div>
  );
}
