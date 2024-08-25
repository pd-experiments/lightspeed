import React from 'react';

interface PageHeaderProps {
  text: string;
  leftItem?: React.ReactNode;
  rightItem?: React.ReactNode;
  icons?: React.ReactNode[];
}

export function PageHeader({ text, leftItem, rightItem, icons = [] }: PageHeaderProps) {
  return (
    <header className="py-6 sm:py-8 border-b border-gray-200 mb-5">
      <div className="max-w-[1500px] mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            {leftItem}
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              {text}
              <span className="block mt-1 h-1 w-20 bg-blue-500 rounded-full"></span>
            </h1>
            <div className="flex items-center space-x-2">
              {icons.map((icon, index) => (
                <span key={index} className="text-gray-600">
                  {icon}
                </span>
              ))}
            </div>
          </div>
          {rightItem && (
            <div className="flex items-center space-x-2 text-gray-600">
              {rightItem}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}