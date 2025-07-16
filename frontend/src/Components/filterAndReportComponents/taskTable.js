

import React, { useState } from "react";
import { generatePDF, generateExcel } from "./reportGenerator";

const TaskTable = ({ tasks, resourceTypes = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get unique resource types for dynamic columns
  const dynamicResourceColumns = resourceTypes.map(type => ({
    id: type._id,
    name: type.name,
    accessor: `resources-${type._id}`,
    color: type.color || '#cccccc'
  }));
  return (
    <div className="mt-6">
      <div className="flex flex-wrap justify-between items-center w-full mb-4">
        <h2 className="text-xl bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-semibold">
          Filtered Results
        </h2>

        <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
          <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Generate Report ▼
          </button>
          {isOpen && (
            <div className="absolute right-0 w-36 bg-white border border-gray-300 rounded shadow-lg z-10">
              <ul className="py-2">
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => generatePDF(tasks)}>
                  PDF Report
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => generateExcel(tasks)}>
                  Excel Report
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-blue-300">
            <tr className="text-left">
              <th className="py-3 px-6 border-b">Title</th>
              <th className="py-3 px-6 border-b">Status</th>
              <th className="py-3 px-6 border-b">Assigned To</th>
              <th className="py-3 px-6 border-b">Start Date</th>
              <th className="py-3 px-6 border-b">End Date</th>
              
              {/* Dynamic Resource Type Columns */}
              {dynamicResourceColumns.map((column) => (
                <th key={column.id} className="py-3 px-6 border-b">
                  {column.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks?.length > 0 ? (
              tasks.map((task, index) => (
                <tr 
                  key={task._id} 
                  className={`text-sm ${index % 2 === 0 ? "bg-blue-50" : "bg-blue-100"} hover:bg-blue-200`}
                >
                  <td className="py-3 px-6 border-b whitespace-nowrap">
                    {task.title || "N/A"}
                  </td>
                  
                  <td className="py-3 px-6 border-b">
                    {task.status || "N/A"}
                  </td>
                  
                  <td className="py-3 px-6 border-b whitespace-nowrap">
                    {task.assignments?.length > 0 ? (
                      task.assignments.map((assignment, i) => (
                        <div key={i}>
                          {assignment.user?.first_name} {assignment.user?.last_name}
                          {assignment.role && ` (${assignment.role})`}
                        </div>
                      ))
                    ) : "N/A"}
                  </td>
                  
                  <td className="py-3 px-6 border-b whitespace-nowrap">
                    {task.schedule?.start ? new Date(task.schedule.start).toLocaleDateString() : "N/A"}
                  </td>
                  
                  <td className="py-3 px-6 border-b whitespace-nowrap">
                    {task.schedule?.end ? new Date(task.schedule.end).toLocaleDateString() : "N/A"}
                  </td>
                  
                  {/* Dynamic Resource Type Cells */}
                  {dynamicResourceColumns.map((column) => {
                    const resources = task.resources?.filter(r => 
                      r.resource?.type?._id === column.id || 
                      r.resource?.type === column.id
                    ) || [];
                    
                    return (
                      <td key={column.id} className="py-3 px-6 border-b">
                        {resources.length > 0 ? (
                          <div className="space-y-1">
                            {resources.map((resource, i) => (
                              <div key={i} className="flex items-center">
                                <span 
                                  className="inline-block w-3 h-3 rounded-full mr-2" 
                                  style={{ backgroundColor: column.color }} 
                                />
                                {resource.resource?.displayName || resource.resource?.name || 'Unknown'}
                                {resource.required && (
                                  <span className="ml-2 text-xs text-red-500">(required)</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : "N/A"}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={5 + dynamicResourceColumns.length} 
                  className="py-4 text-center text-gray-500"
                >
                  No tasks found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskTable;