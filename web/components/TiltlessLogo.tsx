export function TiltlessLogo({ className = "", showIcon = true }: { className?: string; showIcon?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0"
        >
          {/* Tilted candlestick */}
          <rect
            x="12"
            y="8"
            width="8"
            height="14"
            rx="2"
            fill="#97fce4"
            transform="rotate(15 16 15)"
          />
          {/* Wick */}
          <rect
            x="15"
            y="4"
            width="2"
            height="6"
            rx="1"
            fill="#97fce4"
            transform="rotate(15 16 7)"
          />
          {/* Stress marks */}
          <rect
            x="24"
            y="12"
            width="2"
            height="3"
            rx="1"
            fill="#ef4444"
            transform="rotate(15 25 13.5)"
          />
          <rect
            x="26"
            y="15"
            width="2"
            height="3"
            rx="1"
            fill="#ef4444"
            transform="rotate(15 27 16.5)"
          />
          <rect
            x="24"
            y="18"
            width="2"
            height="3"
            rx="1"
            fill="#ef4444"
            transform="rotate(15 25 19.5)"
          />
          {/* Base line */}
          <rect
            x="4"
            y="28"
            width="24"
            height="2"
            rx="1"
            fill="#97fce4"
          />
        </svg>
      )}
      <span className="font-display text-xl font-bold tracking-tight text-brand-mint">
        Tiltless
      </span>
    </div>
  );
}
