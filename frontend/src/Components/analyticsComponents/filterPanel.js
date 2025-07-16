
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { FiFilter, FiSearch, FiCalendar, FiX, FiUsers, FiPackage } from 'react-icons/fi';
import "react-datepicker/dist/react-datepicker.css";
// A reusable component for the search-and-select dropdown
const SearchableSelect = ({ label, icon, placeholder, searchTerm, onSearchChange, items, onSelectItem, selectedItems, onRemoveItem, renderItem, getItemById, pillColorClass }) => {
    const filteredItems = searchTerm
        ? items.filter(item => renderItem(item).toLowerCase().includes(searchTerm.toLowerCase()) && !selectedItems.includes(item._id))
        : items.filter(item => !selectedItems.includes(item._id));

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">{icon} {label}</label>
            <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-1.5 text-sm border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchTerm && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {filteredItems.length > 0 ? filteredItems.map(item => (
                            <div key={item._id} onClick={() => onSelectItem(item._id)} className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100">
                                {renderItem(item)}
                            </div>
                        )) : <div className="px-4 py-2 text-sm text-gray-500">No matches found.</div>}
                    </div>
                )}
            </div>
            <div className="flex flex-wrap gap-2 pt-1 min-h-[30px]">
                {selectedItems.map(itemId => {
                    const item = getItemById(itemId);
                    return item ? (
                        <span key={itemId} className={`inline-flex items-center px-2 py-1 text-xs rounded-full font-semibold ${pillColorClass}`}>
                            {renderItem(item)}
                            <button onClick={() => onRemoveItem(itemId)} className="ml-1.5 font-bold opacity-70 hover:opacity-100">
                                <FiX size={12}/>
                            </button>
                        </span>
                    ) : null;
                })}
            </div>
        </div>
    );
};
const FilterPanel = ({
    filters,
    onApplyFilters,
    availableUsers = [],
    availableResources = [],
}) => {
    const [userSearch, setUserSearch] = useState('');
    const [resourceSearch, setResourceSearch] = useState('');

    const handleDateChange = (dates) => {
        const [start, end] = dates;
        onApplyFilters({
            dateRange: {
                start: start ? start.toISOString().split('T')[0] : '',
                end: end ? end.toISOString().split('T')[0] : '',
            },
        });
    };

    const setQuickDateRange = (range) => {
        const end = new Date();
        const start = new Date();
        if (range === 'last7') start.setDate(end.getDate() - 7);
        if (range === 'thisMonth') start.setDate(1);
        onApplyFilters({ dateRange: { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] } });
    };
    
    const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
    const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

    const addUser = (userId) => {
        if (userId && !filters.userIds.includes(userId)) {
            onApplyFilters({ userIds: [...filters.userIds, userId] });
            setUserSearch('');
        }
    };
    const removeUser = (userId) => {
        onApplyFilters({ userIds: filters.userIds.filter(id => id !== userId) });
    };

    const addResource = (resourceId) => {
        if (resourceId && !filters.resourceIds.includes(resourceId)) {
            onApplyFilters({ resourceIds: [...filters.resourceIds, resourceId] });
            setResourceSearch('');
        }
    };
    const removeResource = (resourceId) => {
        onApplyFilters({ resourceIds: filters.resourceIds.filter(id => id !== resourceId) });
    };

   
    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
                <FiFilter className="h-6 w-6 text-gray-500" />
                <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* --- ENHANCED DATE RANGE PICKER --- */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><FiCalendar/> Date Range</label>
                    <div className="relative">
                        <DatePicker
                            selectsRange={true}
                            startDate={startDate}
                            endDate={endDate}
                            onChange={handleDateChange}
                            isClearable={true}
                            placeholderText="Select a date range"
                            className="w-full px-3 py-1.5 text-sm border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex gap-3 text-xs">
                        <button onClick={() => setQuickDateRange('last7')} className="text-blue-600 hover:underline">Last 7 Days</button>
                        <button onClick={() => setQuickDateRange('thisMonth')} className="text-blue-600 hover:underline">This Month</button>
                    </div>
                </div>

                {/* --- REUSABLE SEARCHABLE SELECT FOR USERS --- */}
                <SearchableSelect
                    label="Filter by User"
                    icon={<FiUsers/>}
                    placeholder="Search users..."
                    searchTerm={userSearch}
                    onSearchChange={setUserSearch}
                    items={availableUsers}
                    onSelectItem={addUser}
                    selectedItems={filters.userIds}
                    onRemoveItem={removeUser}
                    renderItem={user => `${user.first_name} ${user.last_name}`}
                    getItemById={userId => availableUsers.find(u => u._id === userId)}
                    pillColorClass="bg-blue-100 text-blue-800"
                />

                {/* --- REUSABLE SEARCHABLE SELECT FOR RESOURCES --- */}
                <SearchableSelect
                    label="Filter by Resource"
                    icon={<FiPackage/>}
                    placeholder="Search resources..."
                    searchTerm={resourceSearch}
                    onSearchChange={setResourceSearch}
                    items={availableResources}
                    onSelectItem={addResource}
                    selectedItems={filters.resourceIds}
                    onRemoveItem={removeResource}
                    renderItem={resource => resource.displayName}
                    getItemById={resourceId => availableResources.find(r => r._id === resourceId)}
                    pillColorClass="bg-green-100 text-green-800"
                />
            </div>
        </div>
    );
};
export default FilterPanel;