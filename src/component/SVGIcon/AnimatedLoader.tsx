import React from "react";

interface AnimatedLoaderProps {
  size?: "small" | "medium" | "large";
  variant?: "spinner" | "dots" | "pulse" | "bounce";
  color?: string;
  text?: string;
}

const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({
  size = "medium",
  variant = "spinner",
  color = "#3B82F6",
  text,
}) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  const textSizeClasses = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base",
  };

  const renderSpinner = () => (
    <div className="relative">
      {/* Outer rotating ring */}
      <div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-4 rounded-full animate-spin`}
        style={{ borderTopColor: color }}
      />
      {/* Inner pulsing dot */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-pulse"
        style={{ backgroundColor: color }}
      />
    </div>
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`w-2 h-2 rounded-full animate-bounce`}
          style={{
            backgroundColor: color,
            animationDelay: `${index * 0.1}s`,
            animationDuration: "0.6s",
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div
      className={`${sizeClasses[size]} rounded-full animate-pulse`}
      style={{ backgroundColor: color }}
    />
  );

  const renderBounce = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`w-2 h-2 rounded-full animate-bounce`}
          style={{
            backgroundColor: color,
            animationDelay: `${index * 0.15}s`,
            animationDuration: "1s",
          }}
        />
      ))}
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return renderDots();
      case "pulse":
        return renderPulse();
      case "bounce":
        return renderBounce();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {renderLoader()}
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default AnimatedLoader;
