export function TricolorWaves() {
  return (
    <div className="fixed top-0 left-0 right-0 h-[100px] md:h-[220px] overflow-hidden pointer-events-none z-[40]">
      <div 
        className="relative w-full h-full opacity-60"
        style={{
          maskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)'
        }}
      >
        <svg
          className="absolute top-0 left-0 w-full h-full"
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
        >
          {/* 1. WHITE LAYER (Deepest) */}
          <path
            d="M0,0 H1440 V140 C1200,180 1000,100 750,150 C500,200 250,110 0,160 Z"
            fill="white"
            fillOpacity="0.2"
          />
          
          {/* 2. GREEN LAYER (Over White) */}
          <path
            d="M0,0 H1440 V100 C1300,140 1100,110 900,160 C700,210 400,90 0,130 Z"
            fill="#138808"
            fillOpacity="0.35"
          />
          
          {/* 3. SAFFRON LAYER (Topmost) */}
          <path
            d="M0,0 H1440 V60 C1350,110 1200,60 1000,110 C800,160 500,70 0,100 Z"
            fill="#FF9933"
            fillOpacity="0.55"
          />
        </svg>

        {/* Subtle blur for a glass/smoke effect */}
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>
    </div>
  )
}
