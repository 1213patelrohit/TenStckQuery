import React from "react";
import AnimatedLoader from "./SVGIcon/AnimatedLoader";
import Loader from "./SVGIcon/Loader";

const LoaderShowcase: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Loader Showcase</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Spinner Variants */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Spinner Loaders
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Small:</span>
              <Loader size="small" color="#3B82F6" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Medium:</span>
              <Loader size="medium" color="#10B981" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Large:</span>
              <Loader size="large" color="#F59E0B" />
            </div>
            <div className="flex items-center justify-center">
              <Loader size="medium" color="#8B5CF6" text="Loading..." />
            </div>
          </div>
        </div>

        {/* Animated Variants */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Animated Loaders
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Dots:</span>
              <AnimatedLoader size="medium" variant="dots" color="#EF4444" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pulse:</span>
              <AnimatedLoader size="medium" variant="pulse" color="#06B6D4" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bounce:</span>
              <AnimatedLoader size="medium" variant="bounce" color="#84CC16" />
            </div>
            <div className="flex items-center justify-center">
              <AnimatedLoader
                size="large"
                variant="spinner"
                color="#F97316"
                text="Processing..."
              />
            </div>
          </div>
        </div>

        {/* Size Comparison */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Size Comparison
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Small:</span>
              <AnimatedLoader size="small" variant="dots" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Medium:</span>
              <AnimatedLoader size="medium" variant="dots" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Large:</span>
              <AnimatedLoader size="large" variant="dots" />
            </div>
            <div className="flex items-center justify-center">
              <AnimatedLoader
                size="large"
                variant="bounce"
                color="#EC4899"
                text="Large with text"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Usage Examples
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Basic Loader</h4>
            <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
              {`<Loader 
  size="medium" 
  color="#3B82F6" 
  text="Loading..." 
/>`}
            </pre>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Animated Loader</h4>
            <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
              {`<AnimatedLoader 
  size="large" 
  variant="spinner" 
  color="#10B981" 
  text="Processing..." 
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoaderShowcase;
