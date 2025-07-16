import React from 'react';
function getColorForStatus(status) {
    console.log("status",status);
    switch (status) {
        case 'done':
            return 'blue';
        case 'in_progress':
            return 'green';
        case 'pending':
            return 'yellow';
        case 'overdue':
            return 'red';
        default:
            return 'green'; // default color if status is undefined or unexpected
    }
}


export default getColorForStatus;