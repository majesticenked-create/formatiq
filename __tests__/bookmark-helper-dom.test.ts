/** @vitest-environment jsdom */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import BookmarkHelper from '../components/layout/BookmarkHelper';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLElement | null = null;

function setNav(platform: string, ua: string, touch = 0, clipboard?: unknown) {
  const def = (k: string, v: unknown) => Object.defineProperty(navigator, k, { value: v, configurable: true });
  def('platform', platform);
  def('userAgent', ua);
  def('maxTouchPoints', touch);
  def('clipboard', clipboard);
}

function mount() {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  act(() => root!.render(createElement(BookmarkHelper)));
  return host;
}

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = host = null;
  vi.useRealTimers();
});

const btn = () => host!.querySelector('button.bookmark-btn') as HTMLButtonElement;
const click = (el: Element) => act(() => void el.dispatchEvent(new MouseEvent('click', { bubbles: true })));

describe('BookmarkHelper (jsdom)', () => {
  it('opens on click, toggles aria-expanded, links aria-controls to the dialog', () => {
    setNav('MacIntel', 'Macintosh; Intel Mac OS X');
    mount();
    expect(btn().getAttribute('aria-expanded')).toBe('false');
    expect(btn().getAttribute('aria-label')).toBe('Bookmark Formatiq');
    click(btn());
    expect(btn().getAttribute('aria-expanded')).toBe('true');
    const panel = host!.querySelector('[role="dialog"]')!;
    expect(panel.id).toBe(btn().getAttribute('aria-controls'));
    expect(panel.textContent).toContain('Save Formatiq.tools so your favorite tools are one shortcut away.');
    expect(host!.textContent).not.toMatch(/Bookmarked/);
  });

  it('Mac shows ⌘ + D; Windows shows Ctrl + D', () => {
    setNav('MacIntel', 'Macintosh; Intel Mac OS X');
    mount();
    click(btn());
    expect(host!.querySelector('.bookmark-shortcut')!.textContent).toBe('⌘ + D');
    act(() => root!.unmount());
    host!.remove();
    setNav('Win32', 'Windows NT 10.0');
    mount();
    click(btn());
    expect(host!.querySelector('.bookmark-shortcut')!.textContent).toBe('Ctrl + D');
  });

  it('mobile shows menu guidance and no desktop shortcut', () => {
    setNav('iPhone', 'iPhone; CPU iPhone OS 17_0', 5);
    mount();
    click(btn());
    expect(host!.querySelector('.bookmark-shortcut')).toBeNull();
    expect(host!.textContent).toContain('Add to Home Screen');
    expect(host!.textContent).not.toMatch(/⌘|Ctrl/);
  });

  it('Escape closes and returns focus to the button; outside click closes', () => {
    setNav('Win32', 'Windows NT 10.0');
    mount();
    click(btn());
    act(() => void document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(btn().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(btn());
    click(btn());
    act(() => void document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })));
    expect(btn().getAttribute('aria-expanded')).toBe('false');
  });

  it('Copy URL shows "URL copied" only after success, then resets', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    setNav('Win32', 'Windows NT 10.0', 0, { writeText });
    mount();
    click(btn());
    const copy = [...host!.querySelectorAll('button')].find((b) => b.textContent === 'Copy URL')!;
    await act(async () => void copy.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(writeText).toHaveBeenCalledWith('https://formatiq.tools');
    expect(host!.textContent).toContain('URL copied');
    act(() => void vi.advanceTimersByTime(1900));
    expect(host!.textContent).not.toContain('URL copied');
  });

  it('clipboard failure shows a non-success message and a selectable read-only URL', async () => {
    setNav('Win32', 'Windows NT 10.0', 0, { writeText: () => Promise.reject(new Error('no')) });
    mount();
    click(btn());
    const copy = [...host!.querySelectorAll('button')].find((b) => b.textContent === 'Copy URL')!;
    await act(async () => void copy.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(host!.textContent).not.toContain('URL copied');
    expect(host!.textContent).toContain("Couldn't copy");
    const input = host!.querySelector('input.bookmark-url') as HTMLInputElement;
    expect(input.readOnly).toBe(true);
    expect(input.value).toBe('https://formatiq.tools');
  });
});
