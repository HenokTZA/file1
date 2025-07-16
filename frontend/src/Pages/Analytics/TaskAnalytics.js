
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAnalyticsData } from '../../features/analyticsSlice';
import { useTaskAnalytics } from '../../hooks/useTaskAnalytics';

import FilterPanel from '../../Components/analyticsComponents/filterPanel';
import KPISection from '../../Components/analyticsComponents/KPISection';
import DataGrid from '../../Components/analyticsComponents/dataGrid';
import ActionBar from '../../Components/analyticsComponents/actionBar';
import CustomColumnDialog from '../../Components/analyticsComponents/customColumnDialog';
import LoadingSpinner from '../../Components/common/LoadingSpinner';
import ErrorAlert from '../../Components/common/ErrorAlert';

const TaskAnalytics = () => {
    const dispatch = useDispatch();
    const [filters, setFilters] = useState({
        dateRange: { start: '', end: '' },
        userIds: [],
        resourceIds: [],
    });
    const [showCustomColumnDialog, setShowCustomColumnDialog] = useState(false);
    const [customColumns, setCustomColumns] = useState([]);

    const { allTasks: rawTasks = [], status, error } = useSelector((state) => state.analytics);

    const {
        processedTasks,
        dynamicColumns,
        kpis,
        availableUsers,
        availableResources
    } = useTaskAnalytics({
        populatedTasks: rawTasks,
        filters: filters,
        customColumns: customColumns,
    });

    // --- DATA FETCHING (Only re-fetches when date range changes) ---
    useEffect(() => {
        dispatch(fetchAnalyticsData({
            startDate: filters.dateRange.start,
            endDate: filters.dateRange.end
        }));
    }, [filters.dateRange, dispatch]);

    // --- EVENT HANDLERS (Updates local state instantly) ---
    const handleApplyFilters = (newFilterValues) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            ...newFilterValues,
            dateRange: newFilterValues.dateRange
                ? { ...prevFilters.dateRange, ...newFilterValues.dateRange }
                : prevFilters.dateRange
        }));
    };

    const handleAddCustomColumn = (columnConfig) => {
        setCustomColumns(prev => [...prev, columnConfig]);
        setShowCustomColumnDialog(false);
    };

    const isLoading = status === 'loading' && rawTasks.length === 0;

    return (
        <div className="min-h-screen  sm:p-4 md:p-6">
            <div className="max-w-screen-2xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Task Analytics
                    </h1>
                    <ActionBar 
    onAddCustomColumn={() => setShowCustomColumnDialog(true)} 
    dataToExport={processedTasks} // Pass the processed data
    columnsToExport={dynamicColumns} // Pass the column definitions
/>

                </div>

                <div className="space-y-4 md:space-y-6">
                    <FilterPanel
                        filters={filters}
                        onApplyFilters={handleApplyFilters}
                        availableUsers={availableUsers}
                        availableResources={availableResources}
                    />

                    {isLoading ? (
                        <div className="flex justify-center py-20"><LoadingSpinner /></div>
                    ) : error ? (
                        <ErrorAlert message={error} />
                    ) : (
                        <>
                            {rawTasks.length === 0 && status === 'succeeded' ? (
                                <div className="text-center py-16 bg-white rounded-lg shadow">
                                    <h3 className="text-lg font-medium text-gray-800">No Data Available</h3>
                                    <p className="text-sm text-gray-500 mt-2">No completed tasks were found for the selected date range.</p>
                                </div>
                            ) : (
                                <>
                                    <KPISection kpis={kpis} />
                                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <DataGrid
                                                data={processedTasks}
                                                columns={dynamicColumns}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                {showCustomColumnDialog && (
                    <CustomColumnDialog
                        onClose={() => setShowCustomColumnDialog(false)}
                        onAdd={handleAddCustomColumn}
                        availableColumns={dynamicColumns}
                    />
                )}
            </div>
        </div>
    );
};

export default TaskAnalytics;
