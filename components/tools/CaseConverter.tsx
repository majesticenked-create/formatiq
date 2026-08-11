'use client';

import { useMemo, useState } from 'react';

const SAMPLE = 'the quick brown fox jumps over the lazy dog';

function splitWords(input: string): string[] {
  return input
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

function toUpper(input: string) {
  return input.toUpperCase();
}

function toLower(input: string) {
  return input.toLowerCase();
}

function toTitle(input: string) {
  return splitWords(input)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function toCamel(input: string) {
  const words = splitWords(input);
  return words
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join('');
}

function toSnake(input: string) {
  return splitWords(input).join('_');
}

function toKebab(input: string) {
  return splitWords(input).join('-');
}

function toConstant(input: string) {
  return splitWords(input).join('_').toUpperCase();
}

interface OutputRow {
  label: string;
  value: string;
}

function CaseRow({ label, value }: OutputRow) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="panel" style={{ marginBottom: 8 }}>
      <div className="panel-bar">
        <span>{label}</span>
        <div className="panel-actions">
          <button className="icon-btn" onClick={copy}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="output mono" style={{ minHeight: 'auto', padding: '8px 12px', wordBreak: 'break-word' }}>
        {value}
      </div>
    </div>
  );
}

export default function CaseConverter() {
  const [input, setInput] = useState(SAMPLE);

  const outputs = useMemo<OutputRow[]>(() => {
    if (!input.trim()) return [];
    return [
      { label: 'UPPERCASE', value: toUpper(input) },
      { label: 'lowercase', value: toLower(input) },
      { label: 'Title Case', value: toTitle(input) },
      { label: 'camelCase', value: toCamel(input) },
      { label: 'snake_case', value: toSnake(input) },
      { label: 'kebab-case', value: toKebab(input) },
      { label: 'CONSTANT_CASE', value: toConstant(input) },
    ];
  }, [input]);

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setInput(SAMPLE)}>
          Load sample
        </button>
        <button className="icon-btn" onClick={() => setInput('')}>
          Clear
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-bar">
          <span>Input text</span>
        </div>
        <textarea className="mono" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
        <div className={`status-line ${outputs.length ? 'status-valid' : 'status-invalid'}`}>
          {outputs.length ? '✓ Converted below' : '✗ Enter some text to convert.'}
        </div>
      </div>

      {outputs.length > 0 && (
        <div>
          {outputs.map((row) => (
            <CaseRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      )}
    </div>
  );
}
