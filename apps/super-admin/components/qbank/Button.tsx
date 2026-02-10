import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading,
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]";

  const variants = {
    primary: "bg-gradient-to-br from-primary to-primary-dark text-white shadow-md hover:shadow-xl hover:-translate-y-0.5 focus:ring-primary/10",
    secondary: "border-2 border-primary bg-transparent text-primary hover:bg-primary/5 hover:border-primary-dark hover:-translate-y-0.5 focus:ring-blue-500/10",
    danger: "bg-error text-white shadow-md hover:shadow-xl hover:-translate-y-0.5 focus:ring-error/10",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    outline: "border-2 border-slate-200 bg-transparent text-slate-600 hover:border-slate-300 hover:bg-slate-50 focus:ring-slate-100"
  };

  const sizes = {
    sm: "px-4 py-1.5 text-xs rounded-lg h-9",
    md: "px-6 py-2.5 text-sm rounded-xl h-11", // 44px spec
    lg: "px-8 py-3 text-base rounded-2xl h-14"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest">Processing</span>
        </div>
      ) : children}
    </button>
  );
};
