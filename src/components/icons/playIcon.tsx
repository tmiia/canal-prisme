interface PlayIconProps {
  className?: string;
  color?: string;
}

const PlayIcon = ({ className, color = "currentColor" }: PlayIconProps) => {    
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} fillRule="evenodd" d="M5.297 2.165A.2.2 0 0 0 5 2.34v19.32a.2.2 0 0 0 .297.175l17.388-9.66a.2.2 0 0 0 0-.35z" clipRule="evenodd"></path>
    </svg>
  );
};

export default PlayIcon;