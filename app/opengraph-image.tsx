import { ImageResponse } from 'next/og';

/**
 * Open Graph image, generated at build time.
 * PLACEHOLDER: replace with a designed brand image when available.
 */
export const alt = 'Tantro — Engineering intelligence into the physical world';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  const dots = Array.from({ length: 140 }, (_, i) => {
    const a = i * 2.39996;
    const r = Math.sqrt(i / 140) * 230;
    return { x: 880 + Math.cos(a) * r, y: 315 + Math.sin(a) * r * 0.8, accent: i % 11 === 0 };
  });
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#0b0c0d', color: '#ece8e0', position: 'relative' }}>
        {dots.map((d, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: d.x,
              top: d.y,
              width: d.accent ? 8 : 4,
              height: d.accent ? 8 : 4,
              borderRadius: 8,
              background: d.accent ? '#e0954a' : 'rgba(217,211,199,0.55)',
            }}
          />
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, width: 760 }}>
          <div style={{ fontSize: 28, letterSpacing: 10, fontWeight: 700 }}>TANTRO</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 72, lineHeight: 1, fontWeight: 600, letterSpacing: -2 }}>Engineering intelligence</div>
            <div style={{ fontSize: 72, lineHeight: 1, fontWeight: 600, letterSpacing: -2, color: '#a39e95' }}>
              into the physical world.
            </div>
          </div>
          <div style={{ display: 'flex', fontSize: 22, color: '#e0954a', letterSpacing: 3 }}>TANTRO.IN</div>
        </div>
      </div>
    ),
    size,
  );
}
