import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const iconSize = sizeClasses[size] || sizeClasses.md;
  const textSize = textClasses[size] || textClasses.md;

  return (
    <div className={`flex flex-col items-center justify-center p-8 space-y-4 animate-in fade-in duration-500 ${className}`}>
      <Loader2 className={`${iconSize} animate-spin text-indigo-600`} />
      {text && <p className={`${textSize} font-medium text-slate-500 animate-pulse`}>{text}</p>}
    </div>
  );
};

export const FullPageLoader = ({ text = 'Loading...' }) => (
  <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="mt-4 text-slate-600 font-medium">{text}</p>
    </div>
  </div>
);

export default LoadingSpinner;
