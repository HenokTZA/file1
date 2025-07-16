
import { useMemo } from 'react';
import { format } from 'date-fns';

/**
 * A safe formula evaluation function using the Function constructor.
 * @param {string} formula - The mathematical formula, e.g., "totalLaborCost / totalLoggedMinutes".
 * @param {object} dataContext - An object with keys matching the variables in the formula.
 * @returns {number} The calculated result, or 0 on error.
 */
const evaluateFormula = (formula, dataContext) => {
    try {
        const keys = Object.keys(dataContext);
        const values = keys.map(key => dataContext[key] || 0);
        const allowedTokens = new Set([...keys, '(', ')', '/', '*', '+', '-']);
        const tokens = formula.replace(/([()/*+-])/g, ' $1 ').trim().split(/\s+/);
        for (const token of tokens) {
            if (!allowedTokens.has(token) && isNaN(parseFloat(token))) {
                console.warn(`Formula contains an invalid or disallowed token: "${token}"`);
                return 0;
            }
        }
        const func = new Function(...keys, `return ${formula}`);
        const result = func(...values);
        return isNaN(result) || !isFinite(result) ? 0 : result;
    } catch (error) {
        console.error(`Error evaluating formula "${formula}":`, error);
        return 0;
    }
};

export const useTaskAnalytics = ({
    populatedTasks = [], // This is the master, unfiltered dataset from Redux
    filters = {},        // The current filter state from the page component
    customColumns = [],  // The user-defined custom columns
}) => {
    
    return useMemo(() => {
        // --- STEP 1: EXTRACT FILTER OPTIONS FROM THE COMPLETE, UNFILTERED DATASET ---
        // This ensures the filter dropdowns are always fully populated.
        const allUsersMap = new Map();
        const allResourcesMap = new Map();
        for (const task of populatedTasks) {
            task.assignments?.forEach(a => a.user && !allUsersMap.has(a.user._id) && allUsersMap.set(a.user._id, a.user));
            task.resources?.forEach(r => r.resource && !allResourcesMap.has(r.resource._id) && allResourcesMap.set(r.resource._id, r.resource));
            task.resourceLogs?.forEach(log => log.resource && !allResourcesMap.has(log.resource._id) && allResourcesMap.set(log.resource._id, log.resource));
        }
        const availableUsers = Array.from(allUsersMap.values());
        const availableResources = Array.from(allResourcesMap.values());

        // --- STEP 2: APPLY FILTERS TO CREATE THE WORKING DATASET ---
        const filteredTasks = populatedTasks.filter(task => {
            // User Filter Logic
            if (filters.userIds?.length > 0) {
                const taskUserIds = new Set(task.assignments.map(a => a.user?._id));
                if (!filters.userIds.some(filterId => taskUserIds.has(filterId))) {
                    return false;
                }
            }
            // Resource Filter Logic
            if (filters.resourceIds?.length > 0) {
                const taskResourceIds = new Set([
                    ...task.resources.map(r => r.resource?._id),
                    ...task.resourceLogs.map(r => r.resource?._id)
                ]);
                if (!filters.resourceIds.some(filterId => taskResourceIds.has(filterId))) {
                    return false;
                }
            }
            return true;
        });

        // --- Handle case where no tasks remain after filtering ---
        if (!filteredTasks.length) {
            return {
                processedTasks: [], dynamicColumns: [], kpis: [],
                availableUsers, availableResources // Still return all possible filter options
            };
        }

        // --- STEP 3: UNPACK, PROCESS, AND CALCULATE (using the smaller `filteredTasks` array) ---
        const userMap = new Map();
        const resourceTypeMap = new Map();
        const resourceToTypeMap = new Map();
        for (const task of filteredTasks) {
            task.assignments?.forEach(a => a.user && !userMap.has(a.user._id) && userMap.set(a.user._id, a.user));
            task.timeLogs?.forEach(t => t.user && !userMap.has(t.user._id) && userMap.set(t.user._id, t.user));
            task.resources?.forEach(r => {
                if (r.resource && r.resource.type) {
                    !resourceTypeMap.has(r.resource.type._id) && resourceTypeMap.set(r.resource.type._id, r.resource.type);
                    !resourceToTypeMap.has(r.resource._id) && resourceToTypeMap.set(r.resource._id, r.resource.type._id);
                }
            });
        }
        
        const allResourceTypes = Array.from(resourceTypeMap.values());
        
        let baseColumns = [
            { key: 'title', label: 'Task', width: 'w-64' },
            { key: 'completedOn', label: 'Completed On', width: 'w-48' },
            { key: 'assignedUsers', label: 'Assigned To', width: 'w-48' },
            { key: 'totalLoggedMinutes', label: 'Time (min)', width: 'w-32', isNumeric: true },
            { key: 'totalLaborCost', label: 'Labor Cost', width: 'w-32', isCurrency: true },
        ];
        
        const resourceColumns = [];
        allResourceTypes.forEach(rt => {
            rt.fieldDefinitions?.forEach(fd => {
                if (fd.isQuantifiable) {
                    const unit = fd.quantifiableUnit ? ` (${fd.quantifiableUnit})` : '';
                    const key = `${fd.quantifiableCategory}_${rt._id}`;
                    resourceColumns.push({ 
                        key, 
                        label: `${fd.displayName || fd.fieldName}${unit}`, 
                        width: 'w-40', 
                        isCurrency: fd.quantifiableCategory === 'cost', 
                        isNumeric: true,
                        resourceTypeId: rt._id // <-- Store the parent type ID
                    });
                }
            });
        });
        
        let dynamicColumns = [...baseColumns, ...resourceColumns];

        const kpiTotals = { totalTasks: 0, totalLaborCost: 0, totalHoursLogged: 0 };
        const processedTasks = filteredTasks.map(task => {
            let processed = { id: task._id, title: task.title };
            processed.completedOn = task.schedule?.end ? format(new Date(task.schedule.end), 'MMM d, yyyy HH:mm') : 'N/A';
            
            let totalLaborCost = 0, totalLoggedMinutes = 0;
            task.timeLogs?.forEach(log => {
                const user = userMap.get(log.user?._id || log.user);
                if (user?.payroll && log.durationMinutes) {
                    totalLaborCost += (log.durationMinutes / 60) * (user.payroll.rate || 0);
                    totalLoggedMinutes += log.durationMinutes;
                }
            });
            processed.totalLaborCost = totalLaborCost;
            processed.totalLoggedMinutes = totalLoggedMinutes;

            const assignedUserNames = new Set();
            task.assignments.forEach(a => userMap.has(a.user?._id) && assignedUserNames.add(userMap.get(a.user._id).first_name || userMap.get(a.user._id).email));
            processed.assignedUsers = Array.from(assignedUserNames).join(', ');

            task.resourceLogs?.forEach(log => {
                const resourceTypeId = resourceToTypeMap.get(log.resource?._id);
                const resourceType = resourceTypeMap.get(resourceTypeId);
                if (resourceType?.fieldDefinitions) {
                    resourceType.fieldDefinitions.forEach(fd => {
                        if (fd.isQuantifiable && log.resource?.fields?.[fd.fieldName]) {
                            const value = Number(log.resource.fields[fd.fieldName]) * log.quantity;
                            const key = `${fd.quantifiableCategory}_${resourceType._id}`;
                            processed[key] = (processed[key] || 0) + value;
                            if (!kpiTotals[key]) kpiTotals[key] = 0;
                            kpiTotals[key] += value;
                        }
                    });
                }
            });
            
            customColumns.forEach(customCol => {
                processed[customCol.key] = evaluateFormula(customCol.formula, processed);
            });
            
            kpiTotals.totalTasks++;
            kpiTotals.totalLaborCost += totalLaborCost;
            kpiTotals.totalHoursLogged += totalLoggedMinutes / 60;
            return processed;
        });
        
        customColumns.forEach(customCol => {
            dynamicColumns.push({
                key: customCol.key, label: customCol.name, width: 'w-40', isNumeric: true,
                isCurrency: customCol.name.toLowerCase().includes('cost')
            });
        });

        const kpis = [
            { title: 'Total Tasks', value: kpiTotals.totalTasks, format: 'number', subtitle: 'Matching filters', color: 'text-blue-600' },
            { title: 'Total Labor Cost', value: kpiTotals.totalLaborCost, format: 'currency', subtitle: 'For filtered tasks', color: 'text-green-600' },
            { title: 'Total Hours Logged', value: kpiTotals.totalHoursLogged, format: 'decimal', subtitle: 'For filtered tasks', color: 'text-orange-600' },
            { title: 'Avg. Duration (Hours)', value: kpiTotals.totalTasks > 0 ? kpiTotals.totalHoursLogged / kpiTotals.totalTasks : 0, format: 'decimal', subtitle: 'Per filtered task', color: 'text-purple-600' },
        ];
        
        resourceColumns.forEach((rc, index) => {
            if (kpiTotals[rc.key] !== undefined) {
                // Look up the resource type using the ID we stored
                const resourceType = resourceTypeMap.get(rc.resourceTypeId);
                kpis.push({
                    title: `Total ${rc.label}`, 
                    value: kpiTotals[rc.key],
                    format: rc.isCurrency ? 'currency' : 'number',
                    // Use the name for a dynamic subtitle, with a fallback
                    subtitle: `From '${resourceType?.name || 'resource'}'`, 
                    color: ['text-red-600', 'text-indigo-600', 'text-pink-600', 'text-teal-600'][index % 4]
                });
            }
        });
        
        return { 
            processedTasks, 
            dynamicColumns, 
            kpis, 
            availableUsers, 
            availableResources 
        };
    }, [populatedTasks, filters, customColumns]);
};