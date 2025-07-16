// utils/statusColor.js
function getColorForStatus(status) {
    switch (status.toLowerCase()) { 
      case 'done':
        return 'blue';
      case 'in progress':
        return 'green';
      case 'pending':
          return '#ffcc00'; // Dark Yellow
      case 'overdue':
        return 'red';
      case 'impossible':
        return 'gray';
      default:
        return 'green'; // Default color
    }
  }
  
  module.exports = getColorForStatus;
  