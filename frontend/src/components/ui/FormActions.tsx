import { ReactNode } from 'react';

interface FormActionsProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

export const FormActions = ({
  children,
  className = '',
  align = 'right'
}: FormActionsProps) => {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div className={`flex items-center gap-3 ${alignmentClasses[align]} ${className}`}>
      {children}
    </div>
  );
};
