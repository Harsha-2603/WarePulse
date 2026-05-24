import React, { forwardRef } from 'react';

export const Input = forwardRef(({ className = '', error, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 
      ${error
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 text-red-900 placeholder:text-red-300'
          : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20'
        } ${className}`}
      {...props}
    />
  );
});

export default Input;
