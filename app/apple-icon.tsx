import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0e1116',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 100,
            fontWeight: 700,
            color: '#f2b705',
            fontFamily: 'system-ui, -apple-system, Helvetica, Arial, sans-serif',
          }}
        >
          {'{}'}
        </div>
      </div>
    ),
    { ...size }
  );
}
