import React, { useState } from 'react';
import { SelectInput } from "../taskComponents/selectInput";

const ResourceTypeFilter = ({ 
  resourceTypes, 
  onFilterChange,
  initialFilters = [],
  getResourcesByType,
  resourcesLoading
}) => {
  // Initialize selected resources
  const [selectedResources, setSelectedResources] = React.useState(() => {
    const selections = {};
    initialFilters.forEach(filter => {
      if (filter.type && filter.resources) {
        selections[filter.type] = filter.resources;
      }
    });
    return selections;
  });

  const handleResourceChange = (typeId, event) => {
    // Extract the value array from the event object
    const selectedValues = event.target.value || [];
    
    // Update selections
    const newSelection = {
      ...selectedResources,
      [typeId]: Array.isArray(selectedValues) ? selectedValues : [selectedValues]
    };
    
    setSelectedResources(newSelection);
    
    // Convert to filter format
    const filters = Object.entries(newSelection)
      .filter(([_, resourceIds]) => resourceIds && resourceIds.length > 0)
      .map(([typeId, resourceIds]) => ({
        type: typeId,
        resources: resourceIds
      }));
    
    onFilterChange(filters);
  };

  // Group resource types by category
  const groupedResourceTypes = resourceTypes?.reduce((acc, type) => {
    const category = type.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(type);
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6">
      {Object.entries(groupedResourceTypes).map(([category, types]) => (
        <div key={category} className="space-y-4">
          <h3 className="font-medium text-gray-700 capitalize">{category}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {types.map(type => {
              const resources = getResourcesByType(type._id) || [];
              const isLoading = resourcesLoading;
              const currentSelection = selectedResources[type._id] || [];

              return (
                <div key={type._id} className="space-y-2">
                 
                  {isLoading ? (
                    <div>Loading {type.name} resources...</div>
                  ) : (
                    <SelectInput
                      name={`resource-${type._id}`}
                      label={type.name}
                      value={currentSelection}
                      onChange={(e) => handleResourceChange(type._id, e)}
                      options={resources.map(res => ({
                        label: res.displayName || res.name,
                        value: res._id
                      }))}
                      isMulti
                      className="w-full"
                    />
                  )}
                  
                  {type.description && (
                    <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const FilterForm = ({ 
  onFilter, 
  onReset, 
  users, 
  resourceTypes,
  
  statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
    { value: 'impossible', label: 'Impossible' }
  ],
  getResourcesByType,
  resourcesLoading
}) => {
  const [filters, setFilters] = useState({
    assignedTo: null,
    startDate: "",
    endDate: "",
    status: "",
    resourceFilters: [], // This is for UI state management
    search: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleResourceFiltersChange = (resourceFilters) => {
    setFilters(prev => ({ ...prev, resourceFilters }));
  };
  const handleApplyFilters = () => {
    // Create clean filters object
    const cleanFilters = {
      ...filters,
      // Only include resources if they exist
      ...(filters.resourceFilters.length > 0 && {
        resource: filters.resourceFilters.flatMap(f => f.resources)
      }),
      // Ensure dates are properly formatted or undefined
      ...(filters.startDate && { startDate: new Date(filters.startDate).toISOString() }),
      ...(filters.endDate && { endDate: new Date(filters.endDate).toISOString() }),
      // Remove null/empty values
      ...(filters.assignedTo && { assignedTo: filters.assignedTo }),
      ...(filters.status && { status: filters.status }),
      ...(filters.search && { search: filters.search })
    };
  
    // Remove the UI-specific field
    delete cleanFilters.resourceFilters;
  
    // Prepare final API payload (matches Postman structure)
    const apiFilters = {
      filters: cleanFilters,
      page: 1,
      limit: 100
    };
  
    console.log("API Filters:", apiFilters);
    onFilter(apiFilters);
  };
  const handleResetFilters = () => {
    setFilters({
      assignedTo: null,
      startDate: "",
      endDate: "",
      status: "",
      resourceFilters: [],
      search: ""
    });
    onReset();
  };

  return (
    <div className="mb-4 p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-lg font-semibold mb-4">Filter Tasks</h2>

      <div className="space-y-6">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleChange}
              className="p-2 border rounded w-full"
              placeholder="Search in title/notes"
            />
          </div>

          <SelectInput
            label="Status"
            name="status"
            value={filters.status}
            onChange={handleChange}
            options={statusOptions}
            isClearable
          />
          
          <SelectInput
            label="Assigned To"
            name="assignedTo"
            value={filters.assignedTo}
            onChange={handleChange}
            options={users?.map(user => ({
              label: `${user.first_name} ${user.last_name}`,
              value: user._id
            })) || []}
            isClearable
          />
        </div>

        {/* Resource Type Filters */}
        <ResourceTypeFilter 
          resourceTypes={resourceTypes}
          onFilterChange={handleResourceFiltersChange}
          initialFilters={filters.resourceFilters}
          getResourcesByType={getResourcesByType}
          resourcesLoading={resourcesLoading}
        />

        {/* Date Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
              className="p-2 border rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
              className="p-2 border rounded w-full"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button 
            onClick={handleApplyFilters}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Apply Filters
          </button>
          <button 
            onClick={handleResetFilters}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterForm;