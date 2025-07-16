
import { useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResourcesByType, fetchAvailableResources } from '../features/resourceSlice';

export const useResources = (typeIds = [], options = {}) => {
  const { fetchAllOnMount = false } = options; // Default to false

  const dispatch = useDispatch();
  const {
    data: resourcesStateData,
    availableResources,
    availableStatus,
    loading,
    error
  } = useSelector(state => state.resources);

  useEffect(() => {
    // Only run this fetch if the component explicitly asks for it.
    if (fetchAllOnMount && typeIds && typeIds.length > 0) {
      typeIds.forEach(typeId => {
        dispatch(fetchResourcesByType(typeId));
      });
    }
  }, [dispatch, JSON.stringify(typeIds), fetchAllOnMount]); 

  // This function is perfect, no changes needed
  const getAvailableResourcesForType = useCallback((typeId, startTime, endTime) => {
    if (!typeId || !startTime || !endTime) return;
    dispatch(fetchAvailableResources({ typeId, startTime, endTime }));
  }, [dispatch]);

  const typeSpecificResources = useMemo(() => {
    if (typeIds.length !== 1) return [];
    return resourcesStateData.resources?.filter(res => res.type?._id === typeIds[0] || res.type === typeIds[0]) || [];
  }, [resourcesStateData.resources, typeIds.join(',')]);

  const allResourcesByType = useMemo(() => {
    if (!resourcesStateData.resources || resourcesStateData.resources.length === 0) {
      return {};
    }
    // Group resources into a map like { typeId: [resource1, resource2] }
    return resourcesStateData.resources.reduce((acc, resource) => {
      const typeId = resource.type?._id || resource.type;
      if (!acc[typeId]) {
        acc[typeId] = [];
      }
      acc[typeId].push(resource);
      return acc;
    }, {});
  }, [resourcesStateData.resources]);

  const refreshResources = useCallback((idsToRefresh = typeIds) => {
    idsToRefresh.forEach(typeId => {
      dispatch(fetchResourcesByType(typeId));
    });
  }, [dispatch, typeIds.join(',')]);
  return {
    typeSpecificResources,
    availableResources,
    isFetchingAvailable: availableStatus === 'loading',
    getAvailableResourcesForType,
    allResourcesByType,
    loading,
    error,
    refreshResources,
  };
 
};
