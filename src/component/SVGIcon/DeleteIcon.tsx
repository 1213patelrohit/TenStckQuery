interface DeleteIconProps {
  className?: string;
  isAnimating?: boolean;
}

export default function DeleteIcon({
  className = "",
  isAnimating = false,
}: DeleteIconProps) {
  return (
    <div className={`relative ${isAnimating ? "animate-bounce" : ""}`}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-red-500 transition-all duration-300 ${
          isAnimating
            ? "transform scale-75 rotate-12 translate-y-1"
            : "hover:scale-110"
        } ${className}`}
      >
        <polyline points="3,6 5,6 21,6"></polyline>
        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>

      {/* Animated file/document moving into trash */}
      {isAnimating && (
        <div className="absolute -top-2 -left-1 animate-ping">
          <svg
            width="8"
            height="8"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-red-400 opacity-75"
          >
            <rect
              x="3"
              y="4"
              width="18"
              height="18"
              rx="2"
              ry="2"
              fill="currentColor"
            />
            <path d="M9 9h6v6H9z" fill="white" />
          </svg>
        </div>
      )}
    </div>
  );
}
