

import React, { useState, useEffect } from 'react';
import { SelectInput } from './selectInput'; // Make sure this path is correct
import { addDays, addWeeks, addMonths, addYears, format } from 'date-fns';

// Helper function remains the same
const calculateEndDateFromOccurrences = (startDate, frequency, interval, occurrences) => {
    if (!startDate || occurrences <= 0) return null;
    let endDate = new Date(startDate);
    let count = 1; 

    while (count < occurrences) {
        switch (frequency) {
            case 'daily': endDate = addDays(endDate, interval); break;
            case 'weekly': endDate = addWeeks(endDate, interval); break;
            case 'monthly': endDate = addMonths(endDate, interval); break;
            case 'yearly': endDate = addYears(endDate, interval); break;
            default: return null;
        }
        count++;
    }
    return endDate.toISOString();
};


const RecurrencePicker = ({ value, onChange, startDate }) => {
    // --- STATE REFINEMENTS ---
    const [frequency, setFrequency] = useState(value?.repeat_frequency || 'none');
    const [interval, setInterval] = useState(1);
    // Default to 'on' since 'never' is removed.
    const [endCondition, setEndCondition] = useState('on'); 
    const [endDate, setEndDate] = useState('');
    const [occurrences, setOccurrences] = useState(10);

    // --- EFFECT 1: Set a sensible default end date when frequency changes ---
    useEffect(() => {
        // When user selects a frequency for the first time, and there's a start date
        if (frequency !== 'none' && startDate && !endDate) {
            const defaultEndDate = addMonths(new Date(startDate), 1);
            setEndDate(format(defaultEndDate, 'yyyy-MM-dd'));
        }
        // If user switches back to 'none', clear the details
        if (frequency === 'none') {
            setEndDate('');
            setOccurrences(10);
            setInterval(1);
        }
    }, [frequency, startDate]);

    // --- EFFECT 2: The "Translator" to the backend format ---
    
useEffect(() => {
    if (frequency === 'none') {
        onChange({ repeat_frequency: 'none', task_period: null });
        return;
    }

    let task_period = null;
    if (endCondition === 'on') {
        task_period = endDate ? new Date(endDate).toISOString() : null;
    } else if (endCondition === 'after') {
        task_period = calculateEndDateFromOccurrences(startDate, frequency, interval, occurrences);
    }

        let backendFrequency = frequency;
    if (interval > 1) {
        
        backendFrequency = `${interval} ${frequency}`;
    }
   

    onChange({
        // Send the newly constructed string
        repeat_frequency: backendFrequency,
        task_period: task_period
    });

}, [frequency, interval, endCondition, endDate, occurrences, startDate, onChange]);

    const renderRecurrenceDetails = () => {
        if (frequency === 'none') return null;

        return (
            // This is the styled "widget" container
            <div className="mt-4 bg-gray-50 p-4 px-4 rounded-lg border border-gray-200 space-y-4">
                {/* --- "Repeat Every" Section --- */}
                {/* <div className="flex items-baseline space-x-2">
                    <span className="font-medium text-gray-700">Repeat every</span>
                    <input
                        type="number"
                        value={interval}
                        onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-16 py-1 px-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-gray-600">
                        {`${frequency}${interval > 1 ? 's' : ''}`}
                    </span>
                </div> */}

                {/* <hr className="border-gray-200"/> */}

                {/* --- "Ends" Section --- */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Ends</label>
                    <div className="space-y-3">
                        {/* On a specific date */}
                        <div className="flex items-center">
                            <input type="radio" id="end_on" name="end_condition" value="on" checked={endCondition === 'on'} onChange={(e) => setEndCondition(e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/>
                            <label htmlFor="end_on" className="ml-3 flex items-center space-x-2 text-sm text-gray-600">
                                <span>On</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    onClick={() => setEndCondition('on')}
                                    className="py-1 px-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"
                                    disabled={endCondition !== 'on'}
                                />
                            </label>
                        </div>
                        {/* After N occurrences */}
                        <div className="flex items-center">
                            <input type="radio" id="end_after" name="end_condition" value="after" checked={endCondition === 'after'} onChange={(e) => setEndCondition(e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/>
                            <label htmlFor="end_after" className="ml-3 flex items-center space-x-2 text-sm text-gray-600">
                                <span>After</span>
                                <input
                                    type="number"
                                    value={occurrences}
                                    onChange={(e) => setOccurrences(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                    onClick={() => setEndCondition('after')}
                                    className="w-20 py-1 px-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"
                                    disabled={endCondition !== 'after'}
                                />
                                <span>occurrences</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full">
            <SelectInput
                label="Repeat"
                name="repeat_frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value || 'none')}
                options={[
                    { label: 'Does not repeat', value: 'none' },
                    { label: 'Daily', value: 'daily' },
                    { label: 'Weekly', value: 'weekly' },
                    { label: 'Monthly', value: 'monthly' },
                    { label: 'Yearly', value: 'yearly' },
                ]}
            />
            {renderRecurrenceDetails()}
        </div>
    );
};

export default RecurrencePicker;