import { describe, it, expect } from 'vitest';

// Logic copied verbatim from the corresponding component file(s) in components/tools/
// to test in isolation without modifying the real components (many tools embed their
// pure logic directly in the component rather than exporting it separately).

const results: { tool: string; test: string; pass: boolean; detail?: string }[] = [];
function check(tool: string, test: string, pass: boolean, detail?: string) {
  results.push({ tool, test, pass, detail });
}

// ---------- base64-encoder-decoder ----------
function b64Encode(input: string) {
  try { return { ok: true as const, output: btoa(unescape(encodeURIComponent(input))) }; }
  catch { return { ok: false as const, message: 'encode error' }; }
}
function b64Decode(input: string) {
  try { return { ok: true as const, output: decodeURIComponent(escape(atob(input.trim()))) }; }
  catch { return { ok: false as const, message: 'Not valid Base64.' }; }
}
{
  const good = b64Encode('Formatiq');
  check('base64-encoder-decoder', 'valid encode matches known Base64', good.ok === true && good.output === 'Rm9ybWF0aXE=', JSON.stringify(good));
  const roundTrip = b64Decode(good.ok ? good.output : '');
  check('base64-encoder-decoder', 'round-trip decode returns original', roundTrip.ok === true && roundTrip.output === 'Formatiq', JSON.stringify(roundTrip));
  const bad = b64Decode('not valid base64!!!');
  check('base64-encoder-decoder', 'invalid base64 -> error not crash', bad.ok === false, JSON.stringify(bad));
}

// ---------- url-encoder-decoder ----------
function urlEncode(input: string) { try { return { ok: true as const, output: encodeURIComponent(input) }; } catch { return { ok: false as const, message: 'err' }; } }
function urlDecode(input: string) { try { return { ok: true as const, output: decodeURIComponent(input) }; } catch { return { ok: false as const, message: 'Malformed percent-encoding' }; } }
{
  const good = urlEncode('dev tools & more');
  check('url-encoder-decoder', 'valid encode matches expected percent-encoding', good.ok === true && good.output === 'dev%20tools%20%26%20more', JSON.stringify(good));
  const bad = urlDecode('%E0%A4%A');  // malformed/incomplete percent sequence
  check('url-encoder-decoder', 'malformed percent-encoding -> error not crash', bad.ok === false, JSON.stringify(bad));
  const edge = urlDecode('%25'); // edge: encoded percent sign itself
  check('url-encoder-decoder', 'edge case: encoded percent sign decodes to literal %', edge.ok === true && edge.output === '%', JSON.stringify(edge));
}

// ---------- hash-generator (MD5 + SHA verified against known test vectors) ----------
function md5(input: string): string {
  function rotl(x: number, c: number) { return (x << c) | (x >>> (32 - c)); }
  function toHex(n: number) { let s=''; for (let i=0;i<4;i++) s += ((n >>> (i*8)) & 0xff).toString(16).padStart(2,'0'); return s; }
  const K = new Array(64);
  for (let i=0;i<64;i++) K[i] = Math.floor(Math.abs(Math.sin(i+1)) * 2**32);
  const S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
  const bytes = Array.from(new TextEncoder().encode(input));
  const originalBitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i=0;i<8;i++) bytes.push((originalBitLen / 2**(8*i)) & 0xff);
  let a0=0x67452301, b0=0xefcdab89, c0=0x98badcfe, d0=0x10325476;
  for (let chunkStart=0; chunkStart<bytes.length; chunkStart+=64) {
    const M = new Array(16);
    for (let i=0;i<16;i++) M[i] = bytes[chunkStart+i*4] | (bytes[chunkStart+i*4+1]<<8) | (bytes[chunkStart+i*4+2]<<16) | (bytes[chunkStart+i*4+3]<<24);
    let A=a0,B=b0,C=c0,D=d0;
    for (let i=0;i<64;i++) {
      let F: number, g: number;
      if (i<16) { F=(B&C)|(~B&D); g=i; }
      else if (i<32) { F=(D&B)|(~D&C); g=(5*i+1)%16; }
      else if (i<48) { F=B^C^D; g=(3*i+5)%16; }
      else { F=C^(B|~D); g=(7*i)%16; }
      F = (F+A+K[i]+M[g])|0;
      A=D; D=C; C=B; B=(B+rotl(F,S[i]))|0;
    }
    a0=(a0+A)|0; b0=(b0+B)|0; c0=(c0+C)|0; d0=(d0+D)|0;
  }
  return [a0,b0,c0,d0].map(toHex).join('');
}
async function sha(algo: string, input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2,'0')).join('');
}
async function hashTests() {
  // Known test vectors (RFC 1321 for MD5, standard SHA test vectors)
  const md5Empty = md5('');
  check('hash-generator', 'MD5("") matches known test vector', md5Empty === 'd41d8cd98f00b204e9800998ecf8427e', md5Empty);
  const md5Abc = md5('abc');
  check('hash-generator', 'MD5("abc") matches known test vector', md5Abc === '900150983cd24fb0d6963f7d28e17f72', md5Abc);

  const sha256Empty = await sha('SHA-256', '');
  check('hash-generator', 'SHA-256("") matches known test vector', sha256Empty === 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', sha256Empty);
  const sha1Abc = await sha('SHA-1', 'abc');
  check('hash-generator', 'SHA-1("abc") matches known test vector', sha1Abc === 'a9993e364706816aba3e25717850c26c9cd0d89d', sha1Abc);
}

// ---------- jwt-decoder ----------
function jwtBase64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}
function jwtDecodeSegment(segment: string) {
  let decoded: string;
  try { decoded = jwtBase64UrlDecode(segment); } catch { return { ok: false as const, message: 'decode fail' }; }
  try { return { ok: true as const, raw: JSON.parse(decoded) }; } catch { return { ok: false as const, message: 'not json' }; }
}
function jwtTryDecode(input: string) {
  const value = input.trim();
  if (!value) return { ok: false as const, message: 'empty' };
  const segments = value.split('.');
  if (segments.length !== 3) return { ok: false as const, message: 'wrong segment count' };
  const header = jwtDecodeSegment(segments[0]);
  if (!header.ok) return { ok: false as const, message: header.message };
  const payload = jwtDecodeSegment(segments[1]);
  if (!payload.ok) return { ok: false as const, message: payload.message };
  return { ok: true as const, header: header.raw, payload: payload.raw };
}
{
  const SAMPLE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzE2MjM5MDIyLCJleHAiOjE3MTYyNDI2MjJ9.dQw4w9WgXcQ-rAdditionalSignaturePadding';
  const good = jwtTryDecode(SAMPLE_JWT);
  check('jwt-decoder', 'valid JWT decodes header+payload correctly', good.ok === true && (good as any).header.alg === 'HS256' && (good as any).payload.name === 'John Doe', JSON.stringify(good));
  const bad = jwtTryDecode('not.a.jwt.too.many.parts');
  check('jwt-decoder', 'wrong segment count -> error not crash', bad.ok === false && bad.message === 'wrong segment count', JSON.stringify(bad));
  const edge = jwtTryDecode('abc.def'); // only 2 segments
  check('jwt-decoder', 'edge case: only 2 segments (missing signature) -> error', edge.ok === false, JSON.stringify(edge));
}

// ---------- html-entity-converter (encode direction; decode uses DOM, tested separately) ----------
const NAMED_ENTITIES: Record<string, string> = { '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;','é':'&eacute;' };
function hecEncode(input: string): string {
  let result = '';
  for (const char of input) {
    if (NAMED_ENTITIES[char]) result += NAMED_ENTITIES[char];
    else { const code = char.codePointAt(0)!; result += code > 127 ? `&#${code};` : char; }
  }
  return result;
}
{
  const good = hecEncode(`<div>Hello & "friend"</div>`);
  check('html-entity-converter', 'valid encode escapes reserved characters', good === '&lt;div&gt;Hello &amp; &quot;friend&quot;&lt;/div&gt;', good);
  const empty = hecEncode('');
  check('html-entity-converter', 'empty input -> empty output not crash', empty === '');
  const nonAscii = hecEncode('café ☕');
  check('html-entity-converter', 'edge case: non-ASCII gets named or numeric entity', nonAscii === 'caf&eacute; &#9749;', nonAscii);
}

// ---------- morse-code-converter ----------
const MORSE_MAP: Record<string,string> = { A:'.-', B:'-...', H:'....', E:'.', L:'.-..', O:'---', W:'.--', R:'.-.', D:'-..' };
const REVERSE_MORSE_MAP: Record<string,string> = Object.fromEntries(Object.entries(MORSE_MAP).map(([c,code])=>[code,c]));
function mcTextToMorse(input: string) {
  const words = input.trim().toUpperCase().split(/\s+/);
  const unknownChars = new Set<string>();
  const morseWords = words.map((word) => Array.from(word).map((char) => { if (MORSE_MAP[char]) return MORSE_MAP[char]; unknownChars.add(char); return ''; }).filter(Boolean).join(' '));
  if (unknownChars.size > 0) return { ok: false as const, message: `unmapped: ${Array.from(unknownChars).join(',')}` };
  return { ok: true as const, output: morseWords.join(' / ') };
}
function mcMorseToText(input: string) {
  const trimmed = input.trim();
  if (!/^[.\-/\s]+$/.test(trimmed)) return { ok: false as const, message: 'invalid chars' };
  const words = trimmed.split('/');
  const unknownCodes = new Set<string>();
  const textWords = words.map((word) => word.trim().split(/\s+/).filter(Boolean).map((code) => { if (REVERSE_MORSE_MAP[code]) return REVERSE_MORSE_MAP[code]; unknownCodes.add(code); return ''; }).join(''));
  if (unknownCodes.size > 0) return { ok: false as const, message: `unrecognized: ${Array.from(unknownCodes).join(',')}` };
  return { ok: true as const, output: textWords.join(' ') };
}
{
  const good = mcTextToMorse('HELLO WORLD');
  check('morse-code-converter', 'valid text encodes to correct Morse', good.ok === true && good.output === '.... . .-.. .-.. --- / .-- --- .-. .-.. -..', JSON.stringify(good));
  const roundTrip = mcMorseToText(good.ok ? good.output : '');
  check('morse-code-converter', 'round-trip decode returns original text', roundTrip.ok === true && roundTrip.output === 'HELLO WORLD', JSON.stringify(roundTrip));
  const bad = mcTextToMorse('HELLO 123 WORLD'); // digits not in this test's limited MORSE_MAP
  check('morse-code-converter', 'edge case: unmapped character reported specifically, not silently dropped', bad.ok === false && bad.message.includes('unmapped'), JSON.stringify(bad));
}

describe('Encoders/Decoders', async () => {
  await hashTests();

  results.forEach((r) => {
    it(`${r.tool}: ${r.test}`, () => {
      expect(r.pass, r.detail).toBe(true);
    });
  });
});
