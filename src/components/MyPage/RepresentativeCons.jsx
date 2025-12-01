import React, { useMemo } from "react";
import redIcon from "../../assets/emotions/red.png";
import orangeIcon from "../../assets/emotions/orange.png";
import yellowIcon from "../../assets/emotions/yellow.png";
import greenIcon from "../../assets/emotions/green.png";
import blueIcon from "../../assets/emotions/blue.png";
import purpleIcon from "../../assets/emotions/purple.png";

const FALLBACK_ICON = yellowIcon;

function normalizeStarsLocal(stars, { w, h, pad }) {
  if (!stars || stars.length === 0) return [];

  const xs = stars.map((s) => s.x ?? 0);
  const ys = stars.map((s) => s.y ?? 0);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  return stars.map((s) => {
    const nx = (s.x - minX) / rangeX;
    const ny = (s.y - minY) / rangeY;

    return {
      ...s,
      _nx: pad + nx * (w - pad * 2),
      _ny: pad + (1 - ny) * (h - pad * 2),
    };
  });
}

const colorMap = {
  YELLOW: yellowIcon,
  BLUE: blueIcon,
  RED: redIcon,
  ORANGE: orangeIcon,
  GREEN: greenIcon,
  PURPLE: purpleIcon,
};

export default function RepresentativeCons({ data, loading, error }) {
  const width = 270;
  const height = 215;
  const pad = 15;

  if (loading || error || !data) {
    return (
      <svg
        width={width}
        height={height}
        style={{ background: "transparent" }}
      />
    );
  }

  const stars = data.stars || [];
  const connections = data.connections || [];

  const ns = useMemo(
    () => normalizeStarsLocal(stars, { w: width, h: height, pad }),
    [stars]
  );

  const byId = useMemo(() => {
    const m = new Map();
    ns.forEach((s) => m.set(s.starId, s));
    return m;
  }, [ns]);

  const lines = useMemo(() => {
    return connections
      .map((c, idx) => {
        const a = byId.get(c.startStarId);
        const b = byId.get(c.endStarId);
        if (!a || !b) return null;
        return {
          key: `${c.startStarId}-${c.endStarId}-${idx}`,
          x1: a._nx,
          y1: a._ny,
          x2: b._nx,
          y2: b._ny,
        };
      })
      .filter(Boolean);
  }, [connections, byId]);

  return (
    <svg
      width={width}
      height={height}
      style={{ background: "transparent" }}
      className="rounded-[12px]"
    >
      <defs>
        <filter id="rep-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="4.0" result="b2" />
          <feMerge>
            <feMergeNode in="b1" />
            <feMergeNode in="b2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {ns.map((s) => (
        <circle
          key={`halo-${s.starId}`}
          cx={s._nx}
          cy={s._ny}
          r="12"
          fill="none"
          filter="url(#rep-glow)"
        />
      ))}

      <g className="[mix-blend-mode:screen]">
        {lines.map((l) => (
          <line
            key={l.key}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke="#CBE1FF"
            strokeWidth="1.6"
            strokeOpacity="0.9"
          />
        ))}
      </g>

      {ns.map((s, i) => {
        const delayMs = `${((s.starId ?? i) * 137) % 1200}ms`;
        const colorKey = (s.color || "").toUpperCase();
        const icon = colorMap[colorKey] || FALLBACK_ICON;

        return (
          <g key={s.starId ?? i}>
            <image
              href={icon}
              x={s._nx - 10}
              y={s._ny - 10}
              width="20"
              height="20"
              filter="url(#rep-glow)"
              className="animate-pulse [animation-duration:900ms]"
              style={{
                animationDelay: delayMs,
                transformOrigin: "center",
                transformBox: "fill-box",
              }}
            />
            <circle cx={s._nx} cy={s._ny} r="1.8" fill="#fff" />
          </g>
        );
      })}
    </svg>
  );
}
