import * as FeatherIcons from 'react-icons/fi'; // Import all Feather icons at the top
import {  FiPackage } from "react-icons/fi";
const RenderDynamicIcon = (iconName, size = 16, className = "") => {
  if (!iconName) return <FiPackage size={size} className={className} />; // Default icon

  // Try exact match first
  if (FeatherIcons[iconName]) {
    const IconComponent = FeatherIcons[iconName];
    return <IconComponent size={size} className={className} />;
  }

  // Try case-insensitive match (removes "Fi" prefix if present)
  const iconKey = Object.keys(FeatherIcons).find(
    key => key.toLowerCase() === iconName.toLowerCase() || 
           key.toLowerCase() === `fi${iconName.toLowerCase()}`
  );

  if (iconKey) {
    const IconComponent = FeatherIcons[iconKey];
    return <IconComponent size={size} className={className} />;
  }

  // Fallback options
  return (
    <div className="flex items-center">
      <FiPackage size={size} className={`text-gray-400 ${className}`} />
      <span className="ml-1 text-xs text-gray-500">{iconName}</span>
    </div>
  );
};
export default RenderDynamicIcon;