import React from "react";

interface LoaderProps {
  size?: "small" | "medium" | "large";
  color?: string;
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = "medium",
  color = "#3B82F6",
  text,
}) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
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
      {text && <p className="text-sm text-gray-600 animate-pulse">{text}</p>}
    </div>
  );
};

export default Loader;
