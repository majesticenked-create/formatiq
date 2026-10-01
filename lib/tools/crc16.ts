/**
 * Generic, parameterized CRC-16 implementation shared by all CRC-16 variants
 * the CRC-16 Checksum tool exposes. A single bit-by-bit implementation driven
 * by (poly, init, refin, refout, xorout) avoids hand-rolling a separate
 * function per variant, which is exactly how subtle parameter mistakes creep
 * in (see: getting refin/refout backwards silently produces a wrong-but-
 * plausible checksum).
 *
 * Parameter sets below are taken from the standard CRC RevEng catalogue and
 * verified against the catalogue's own "check" value - the CRC of the ASCII
 * string "123456789" - for each variant.
 */

export interface Crc16Params {
  poly: number;
  init: number;
  refin: boolean;
  refout: boolean;
  xorout: number;
}

export type Crc16Variant = 'CRC-16/ARC' | 'CRC-16/CCITT-FALSE' | 'CRC-16/XMODEM';

export const CRC16_VARIANTS: Record<Crc16Variant, Crc16Params & { checkValue: number }> = {
  'CRC-16/ARC': {
    poly: 0x8005,
    init: 0x0000,
    refin: true,
    refout: true,
    xorout: 0x0000,
    checkValue: 0xbb3d,
  },
  'CRC-16/CCITT-FALSE': {
    poly: 0x1021,
    init: 0xffff,
    refin: false,
    refout: false,
    xorout: 0x0000,
    checkValue: 0x29b1,
  },
  'CRC-16/XMODEM': {
    poly: 0x1021,
    init: 0x0000,
    refin: false,
    refout: false,
    xorout: 0x0000,
    checkValue: 0x31c3,
  },
};

function reflect8(byte: number): number {
  let r = 0;
  let v = byte;
  for (let i = 0; i < 8; i++) {
    r = (r << 1) | (v & 1);
    v >>= 1;
  }
  return r & 0xff;
}

function reflect16(value: number): number {
  let r = 0;
  let v = value;
  for (let i = 0; i < 16; i++) {
    r = (r << 1) | (v & 1);
    v >>= 1;
  }
  return r & 0xffff;
}

/** Computes a CRC-16 over `bytes` using the given (poly, init, refin, refout, xorout) parameters. */
export function crc16(bytes: Uint8Array, params: Crc16Params): number {
  let crc = params.init & 0xffff;
  for (let i = 0; i < bytes.length; i++) {
    const b = params.refin ? reflect8(bytes[i]) : bytes[i];
    crc ^= (b << 8) & 0xffff;
    for (let bit = 0; bit < 8; bit++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ params.poly) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  if (params.refout) crc = reflect16(crc);
  return (crc ^ params.xorout) & 0xffff;
}

/** Computes a named CRC-16 variant over `bytes`. */
export function crc16Variant(bytes: Uint8Array, variant: Crc16Variant): number {
  return crc16(bytes, CRC16_VARIANTS[variant]);
}
