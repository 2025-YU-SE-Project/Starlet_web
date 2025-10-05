import React, { useMemo } from "react";
import { normalizeStars } from "../lib/normalize";
import yellowIcon from "../assets/emotions/yellow.png";
import blueIcon from "../assets/emotions/blue.png";
import redIcon from "../assets/emotions/red.png";
import orangeIcon from "../assets/emotions/orange.png";
import whiteIcon from "../assets/emotions/white.png";
import skyblueIcon from "../assets/emotions/skyblue.png";

export default function ConstellationMini({
   stars,
   connections = [],
   width = 200,
   height = 140,
   hideBackground = false,   
 }) {
  const ns = useMemo(
    () => normalizeStars(stars, { w: width, h: height, pad: 10 }),
    [stars, width, height]
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

const colorMap = {
  YELLOW: yellowIcon,
  BLUE: blueIcon,
  RED: redIcon,
  ORANGE: orangeIcon,
  WHITE: whiteIcon,
  SKYBLUE: skyblueIcon,
};

  return (
    <svg width={width} height={height} className="rounded-[12px]">
         <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="4.0" result="b2" />
          <feMerge>
            <feMergeNode in="b1" />
            <feMergeNode in="b2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

    
      {!hideBackground && (
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          rx="12"
          className="fill-[#333333]/40 stroke-[#333333]/60"
        />
      )}
      {ns.map((s) => (
    <circle
      key={`halo-${s.starId}`}
      cx={s._nx}
      cy={s._ny}
      r="12"
      fill="none"
      filter="url(#glow)"
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
    const icon = colorMap[s.color];
    return (
      <g key={s.starId}>
        <image
          href={icon}
          x={s._nx - 10}
          y={s._ny - 10}
          width="20"
          height="20"
          filter="url(#glow)"
          className="animate-pulse [animation-duration:900ms]"
          style={{ animationDelay: delayMs, transformOrigin: "center", transformBox: "fill-box" }}
        />
        <circle cx={s._nx} cy={s._ny} r="1.8" fill="#fff" />
      </g>
    );
  })}
</svg>
  );
}
