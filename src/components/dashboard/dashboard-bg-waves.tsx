"use client"

export function DashboardBgWaves() {
  const NUM_LINES = 40; // 40 lines per color, 120 lines total

  // Procedural generator to create a twisting 3D-like parametric ribbon
  const generateRibbonGroup = (color: string, groupPhaseOffset: number, yGroupOffset: number) => {
    return Array.from({ length: NUM_LINES }, (_, i) => {
      const t = i / (NUM_LINES - 1);

      // Phase determines the mathematical arc of the Lissajous curves
      const phase = t * Math.PI + groupPhaseOffset;

      // Moved from 750 up to 650 to bring it slightly higher on desktop
      const baseY = 650;

      const startX = -200;
      const startY = baseY + (t * 120 - 60) + yGroupOffset;

      const cp1x = 200;
      const cp1y = baseY - 120 + Math.cos(phase) * 120 + yGroupOffset;

      const cp2x = 400;
      const cp2y = baseY + 120 + Math.sin(phase * 1.5) * 120 + yGroupOffset;

      const midX = 600;
      const midY = baseY + Math.cos(phase * 2) * 50 + yGroupOffset;

      const cp4x = 900;
      const cp4y = baseY - 120 + Math.cos(phase) * 120 + yGroupOffset;

      const endX = 1200;
      const endY = baseY + (t * 120 - 60) + yGroupOffset;

      const d = `M ${startX},${startY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${midX},${midY} S ${cp4x},${cp4y} ${endX},${endY}`;

      const opacity = Math.min(0.8, 0.15 + (1 - Math.abs(t - 0.5) * 2) * 0.45);
      const strokeWidth = 0.5 + Math.abs(Math.cos(t * 12.34)) * 1.0;

      return { d, color, opacity, strokeWidth };
    });
  };

  const saffronLines = generateRibbonGroup("#FF9933", 0.0, -40);
  const whiteLines = generateRibbonGroup("#FFFFFF", Math.PI * 0.33, 0);
  const greenLines = generateRibbonGroup("#138808", Math.PI * 0.66, 40);

  const allLines = [...saffronLines, ...whiteLines, ...greenLines];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#10061e]"
    >
      {/* 
        Deep lush purple base overridden. 
        Adding massive, extremely subtle background blobs to create 
        the "beautiful deep purple background with tiny touches of hot pink/red"
      */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#13072e] via-[#0d041a] to-[#080212] opacity-90" />

      <div className="absolute -top-[10%] -right-[5%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] rounded-full bg-[#ff0a54] opacity-[0.05] blur-[120px] mix-blend-screen" />
      <div className="absolute top-[30%] -left-[10%] w-[60vw] h-[60vw] max-w-[900px] max-h-[900px] rounded-full bg-[#8a2be2] opacity-[0.06] blur-[130px] mix-blend-screen" />

      {/* SVG Container shifted down physically on mobile viewports */}
      <div className="absolute inset-0 w-full h-full mix-blend-screen opacity-90 lg:top-[4.75rem] translate-y-[28vh] sm:translate-y-[22vh] md:translate-y-[15vh] lg:translate-y-0">
        <svg
          className="w-full h-full"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>


            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
            </filter>
          </defs>

          {/* Background thick glows */}
          <g filter="url(#neon-glow)" opacity="0.6">
            {allLines.map((line, i) => (
              <path
                key={`glow-${i}`}
                d={line.d}
                stroke={line.color}
                strokeWidth={line.strokeWidth * 3}
                fill="none"
                opacity={line.opacity}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>

          {/* Crisp foreground fibers */}
          <g>
            {allLines.map((line, i) => (
              <path
                key={`sharp-${i}`}
                d={line.d}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
                fill="none"
                opacity={line.opacity + 0.15}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Gentle center spotlight vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#0c0512_100%)] pointer-events-none opacity-80" />
    </div>
  )
}
