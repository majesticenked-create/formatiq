/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  voteStorageKey,
  getStoredVote,
  setStoredVote,
  buildCanonicalUrl,
  buildFeedbackMailto,
  buildEmbedSnippet,
  IMPROVEMENT_REASONS,
} from '../lib/tools/actionBar';

describe('ToolActionBar — vote storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('namespaces the storage key per category+slug', () => {
    expect(voteStorageKey('formatters', 'json-formatter')).toBe('formatiq:tool-vote:formatters:json-formatter');
    expect(voteStorageKey('converters', 'json-formatter')).not.toBe(voteStorageKey('formatters', 'json-formatter'));
  });

  it('returns null when nothing is stored yet', () => {
    expect(getStoredVote('formatters', 'json-formatter')).toBeNull();
  });

  it('persists a helpful vote and reads it back', () => {
    setStoredVote('formatters', 'json-formatter', 'helpful');
    expect(getStoredVote('formatters', 'json-formatter')).toBe('helpful');
    expect(window.localStorage.getItem('formatiq:tool-vote:formatters:json-formatter')).toBe('helpful');
  });

  it('persists a not-helpful vote and reads it back', () => {
    setStoredVote('formatters', 'json-formatter', 'not-helpful');
    expect(getStoredVote('formatters', 'json-formatter')).toBe('not-helpful');
  });

  it('switching a vote overwrites the previous one (mutual exclusivity)', () => {
    setStoredVote('formatters', 'json-formatter', 'helpful');
    setStoredVote('formatters', 'json-formatter', 'not-helpful');
    expect(getStoredVote('formatters', 'json-formatter')).toBe('not-helpful');
  });

  it('clearing a vote (null) removes the stored key', () => {
    setStoredVote('formatters', 'json-formatter', 'helpful');
    setStoredVote('formatters', 'json-formatter', null);
    expect(getStoredVote('formatters', 'json-formatter')).toBeNull();
    expect(window.localStorage.getItem('formatiq:tool-vote:formatters:json-formatter')).toBeNull();
  });

  it('is scoped per tool - voting on one tool does not affect another', () => {
    setStoredVote('formatters', 'json-formatter', 'helpful');
    expect(getStoredVote('converters', 'csv-json-converter')).toBeNull();
  });

  it('ignores garbage values already present under the key', () => {
    window.localStorage.setItem('formatiq:tool-vote:formatters:json-formatter', 'not-a-real-vote');
    expect(getStoredVote('formatters', 'json-formatter')).toBeNull();
  });

  it('getStoredVote does not throw when localStorage.getItem throws', () => {
    const original = window.localStorage.getItem;
    window.localStorage.getItem = () => {
      throw new Error('blocked');
    };
    expect(() => getStoredVote('formatters', 'json-formatter')).not.toThrow();
    expect(getStoredVote('formatters', 'json-formatter')).toBeNull();
    window.localStorage.getItem = original;
  });

  it('setStoredVote does not throw when localStorage.setItem throws', () => {
    const original = window.localStorage.setItem;
    window.localStorage.setItem = () => {
      throw new Error('quota exceeded');
    };
    expect(() => setStoredVote('formatters', 'json-formatter', 'helpful')).not.toThrow();
    window.localStorage.setItem = original;
  });
});

describe('ToolActionBar — canonical URL', () => {
  it('matches the shared tool page convention (https://formatiq.tools/tools/{category}/{slug})', () => {
    expect(buildCanonicalUrl('formatters', 'json-formatter')).toBe(
      'https://formatiq.tools/tools/formatters/json-formatter'
    );
  });
});

describe('ToolActionBar — feedback mailto', () => {
  it('points at the site contact address with an encoded subject and body', () => {
    const href = buildFeedbackMailto({
      toolTitle: 'JSON Formatter',
      canonicalUrl: 'https://formatiq.tools/tools/formatters/json-formatter',
      message: 'It breaks on empty input',
    });
    expect(href.startsWith('mailto:hello@formatiq.tools?')).toBe(true);
    expect(href).toContain('subject=Feedback%3A%20JSON%20Formatter');
    expect(href).toContain('URL%3A%20https%3A%2F%2Fformatiq.tools%2Ftools%2Fformatters%2Fjson-formatter');
  });

  it('URL-encodes user-controlled message content so it cannot break out of the query string', () => {
    const href = buildFeedbackMailto({
      toolTitle: 'JSON Formatter',
      canonicalUrl: 'https://formatiq.tools/tools/formatters/json-formatter',
      message: 'body=x&subject=hijacked&cc=evil@example.com',
    });
    expect(href).not.toContain('&subject=hijacked');
    expect(href).not.toContain('&cc=evil@example.com');
    // The raw ampersands are percent-encoded, not left as literal query separators
    expect(href).toContain('%26subject%3Dhijacked');
  });

  it('includes the optional improvement reason when given', () => {
    const href = buildFeedbackMailto({
      toolTitle: 'JSON Formatter',
      canonicalUrl: 'https://formatiq.tools/tools/formatters/json-formatter',
      message: 'oops',
      reason: 'Incorrect result',
    });
    expect(href).toContain('Reason%3A%20Incorrect%20result');
  });

  it('falls back to a placeholder when no message was typed', () => {
    const href = buildFeedbackMailto({
      toolTitle: 'JSON Formatter',
      canonicalUrl: 'https://formatiq.tools/tools/formatters/json-formatter',
      message: '   ',
    });
    expect(href).toContain('%28no%20message%20entered%29');
  });

  it('exposes exactly the five documented improvement reasons', () => {
    expect(IMPROVEMENT_REASONS).toEqual([
      'Incorrect result',
      'Hard to use',
      'Missing feature',
      'Confusing explanation',
      'Other',
    ]);
  });
});

describe('ToolActionBar — embed snippet', () => {
  it('only ever references the given canonical tool URL, never an arbitrary value', () => {
    const url = 'https://formatiq.tools/tools/formatters/json-formatter';
    const snippet = buildEmbedSnippet(url, 'JSON Formatter');
    expect(snippet).toContain(`src="${url}"`);
    expect(snippet.startsWith('<iframe ')).toBe(true);
    expect(snippet).toContain('JSON Formatter');
  });

  it('does not depend on any user-supplied value beyond the tool identity passed in', () => {
    const snippetA = buildEmbedSnippet('https://formatiq.tools/tools/a/a', 'A');
    const snippetB = buildEmbedSnippet('https://formatiq.tools/tools/b/b', 'B');
    expect(snippetA).not.toContain('/tools/b/b');
    expect(snippetB).not.toContain('/tools/a/a');
  });
});
