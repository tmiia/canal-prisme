interface LoopIconProps {
  className?: string;
  color?: string;
}

const LoopIcon = ({ className, color = "currentColor" }: LoopIconProps) => {    
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} fillRule="evenodd" d="M17.762 14.07a5.52 5.52 0 0 1-3.917 1.622 5.539 5.539 0 1 1 3.917-1.623m1.821-9.653A8.2 8.2 0 0 0 13.75 2a8.2 8.2 0 0 0-5.834 2.417 8.2 8.2 0 0 0-2.417 5.835 8.2 8.2 0 0 0 1.527 4.78l-4.623 4.624a1.372 1.372 0 0 0 1.94 1.941l4.625-4.623a8.2 8.2 0 0 0 4.78 1.526 8.2 8.2 0 0 0 5.836-2.415A8.2 8.2 0 0 0 22 10.25a8.2 8.2 0 0 0-2.417-5.834" clipRule="evenodd"></path>
    </svg>
  );
};

export default LoopIcon;