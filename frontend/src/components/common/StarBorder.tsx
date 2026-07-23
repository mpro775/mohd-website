import React from 'react';
import './StarBorder.css';

interface StarBorderProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  className?: string;
  innerClassName?: string;
  color?: string;
  speed?: string;
  thickness?: number;
  children: React.ReactNode;
}

const StarBorder = ({
  as: Component = 'button',
  className = '',
  innerClassName = '',
  color = 'var(--primary, #37d399)',
  speed = '6s',
  thickness = 1,
  children,
  ...rest
}: StarBorderProps & React.ComponentProps<any>) => {
  return (
    <Component
      className={`star-border-container ${className}`}
      style={{
        padding: `${thickness}px`,
        ...rest.style
      }}
      {...rest}
    >
      <div className="border-gradient-container">
        <div
          className="border-gradient-bottom"
          style={{
            background: `radial-gradient(circle, ${color}, transparent 10%)`,
            animationDuration: speed
          }}
        ></div>
        <div
          className="border-gradient-top"
          style={{
            background: `radial-gradient(circle, ${color}, transparent 10%)`,
            animationDuration: speed
          }}
        ></div>
      </div>
      <div className={`inner-content ${innerClassName}`}>{children}</div>
    </Component>
  );
};

export default StarBorder;
