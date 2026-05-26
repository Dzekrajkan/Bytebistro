interface TrashIconProps {
  size?: number;
  className?: string;
}

function TrashIcon({ size = 16, className = "cursor-pointer hover:text-blue-500 transition-colors duration:300" }: TrashIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M19 6L18.1333 19C18.0605 20.091 17.1547 21 16.0613 21H7.93866C6.8453 21 5.93945 20.091 5.86667 19L5 6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
};

export default TrashIcon