
import { useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResourcesByType, fetchAvailableResources } from '../features/resourceSlice';

export const useResources = (typeIds = []) => {
  const dispatch = useDispatch();
  const {
    data: resourcesStateData,
    availableResources,
    availableStatus,
    loading,
    error
  } = useSelector(state => state.resources);

   useEffect(() => {
   
    if (typeIds.length > 0) {
        dispatch(fetchResourcesByType(typeIds[0]));
    }
  }, [dispatch, typeIds.join(',')]); // Depend on joined IDs to refetch if the array changes

  const getAvailableResourcesForType = useCallback((typeId, startTime, endTime) => {
    if (!typeId || !startTime || !endTime) return;
    dispatch(fetchAvailableResources({ typeId, startTime, endTime }));
  }, [dispatch]);

  // --- DATA SELECTORS / MEMOS ---

  // Memoized resources for ResourceListPage
  const typeSpecificResources = useMemo(() => {
    if (typeIds.length !== 1) return [];
    return resourcesStateData.resources?.filter(res => res.type?._id === typeIds[0] || res.type === typeIds[0]) || [];
  }, [resourcesStateData.resources, typeIds.join(',')]);


  const refreshResources = useCallback((idsToRefresh = typeIds) => {
    idsToRefresh.forEach(typeId => {
      dispatch(fetchResourcesByType(typeId));
    });
  }, [dispatch, typeIds.join(',')]);

  return {
    // Data for ResourceListPage
    typeSpecificResources,
    // Data for TaskForm (the new, important parts)
    availableResources, // The map from Redux: { typeId: [resources] }
    isFetchingAvailable: availableStatus === 'loading', // Derived loading state
    getAvailableResourcesForType, // The function to trigger the fetch

    // Common properties
    loading, // General loading state from the slice
    error,
    refreshResources,
  };
};