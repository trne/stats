import React, { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
}

const Card: React.FC<CardProps> = ({ 
  title, 
  children, 
  className = '', 
  titleClassName = '' 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {title && (
        <div className={`px-4 py-3 border-b border-gray-200 ${titleClassName}`}>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default Card;