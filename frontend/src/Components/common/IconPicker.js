import { useState } from 'react';
import * as FeatherIcons from 'react-icons/fi';

const IconExplorer = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const availableIcons = Object.entries(FeatherIcons)
    .filter(([name]) => name !== 'default' && name !== 'IconBase')
    .map(([name, IconComponent]) => ({
      name,
      component: IconComponent
    }));

  const filteredIcons = availableIcons.filter(icon =>
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 border rounded-lg bg-white shadow-lg">
      <input
        type="text"
        placeholder="Search icons..."
        className="w-full p-2 border rounded mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="grid grid-cols-6 gap-2 h-64 overflow-y-auto">
        {filteredIcons.map((icon, index) => (
          <div
            key={index}
            className="p-2 flex flex-col items-center cursor-pointer hover:bg-gray-100 rounded"
            onClick={() => onSelect(icon.name)}
          >
            <icon.component size={20} />
            <span className="text-xs mt-1 truncate w-full text-center">{icon.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IconExplorer;