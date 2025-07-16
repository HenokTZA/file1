import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { filterTasks, resetFilteredTasks } from "../../features/taskSlice";
import FilterForm from "../../Components/filterAndReportComponents/filterForm";
import TaskTable from "../../Components/filterAndReportComponents/taskTable";
import { useResources } from "../../hooks/useResources"; // Import your custom hook
import { useUsers } from '../../hooks/useUsers';
const FilterPage = () => {
  const dispatch = useDispatch();

  // Get data from Redux store (fetched globally in App.js)
  const { tasks, filteredTasks, currentView, status } = useSelector((state) => state.tasks);
  // const { users } = useSelector((state) => state.users);
  const { users } = useUsers();
  const { resourceTypes, loading: resourceTypesLoading } = useSelector((state) => state.resourceTypes);
  
  // Get resource IDs for the hook
  const resourceTypeIds = resourceTypes?.map(type => type._id) || [];
  const { allResourcesByType, loading: resourcesLoading } = useResources(
    resourceTypeIds, 
    { fetchAllOnMount: true } // Tell the hook to fetch all resources
  );
  // Use the resources hook
  // const { allResourcesByType, loading: resourcesLoading } = useResources(resourceTypeIds);
  // Handle filtering
  const handleFilter = (filters) => {
    dispatch(filterTasks(filters));
  };

  // Reset filters
  const resetFilters = () => {
    dispatch(resetFilteredTasks());
  };

  // Determine which tasks to display
  const displayedTasks = currentView === "filteredTasks" ? filteredTasks : tasks;

  return (
    <div className="p-6 lg:ml-80">
      <FilterForm
        onFilter={handleFilter}
        onReset={resetFilters}
        users={users}
        resourceTypes={resourceTypes}
        allResourcesByType={allResourcesByType}
        resourcesLoading={resourcesLoading || resourceTypesLoading}
      />
      {status === "loading" ? (
        <p>Loading tasks...</p>
      ) : (
        <TaskTable 
          tasks={displayedTasks} 
          resourceTypes={resourceTypes}
        />
      )}
    </div>
  );
};

export default FilterPage;
