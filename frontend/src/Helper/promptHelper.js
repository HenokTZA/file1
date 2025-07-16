import Swal from 'sweetalert2';

// // Utility function to format time as HH:mm
const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

const promptForStartAndEndTime = async (defaultStartTime, defaultEndTime, selectedEvents = []) => {
    console.log("defaultStartTime, defaultEndTime,", defaultStartTime, defaultEndTime);
    console.log("selecetd",selectedEvents)
    const { value: times } = await Swal.fire({
        title: 'Set Event Times',
        html: `
            <div style="max-height: 400px; overflow-y: auto; text-align: left;">
                ${selectedEvents.length > 1 ? 
                    selectedEvents.map((event, index) => `
                        <div style="padding: 10px; margin: 10px 0; border-left: 3px solid ${event.color || '#3788d8'}; background: rgba(0,0,0,0.03);">
                            <div style="font-weight: bold; margin-bottom: 8px;">${event.title}</div>
                            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                                <div>
                                    <label for="startTime_${index}" style="display: block; margin-bottom: 4px;">Start Time:</label>
                                    <input type="time" id="startTime_${index}" class="swal2-input" value="${formatTime(event.start)}" style="width: auto;">
                                </div>
                                <div>
                                    <label for="endTime_${index}" style="display: block; margin-bottom: 4px;">End Time:</label>
                                    <input type="time" id="endTime_${index}" class="swal2-input" value="${formatTime(event.end)}" style="width: auto;">
                                </div>
                            </div>
                        </div>
                    `).join('')
                    : `
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                        <div>
                            <label for="startTimePicker" style="font-weight: bold; margin-right: 8px;">Start Time:</label>
                            <input type="time" id="startTimePicker" class="swal2-input" value="${formatTime(defaultStartTime)}" style="width: auto;">
                        </div>
                        <div>
                            <label for="endTimePicker" style="font-weight: bold; margin-right: 8px;">End Time:</label>
                            <input type="time" id="endTimePicker" class="swal2-input" value="${formatTime(defaultEndTime)}" style="width: auto;">
                        </div>
                    </div>
                `}
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
        showCloseButton: true,
        preConfirm: () => {
            const inputTimes = selectedEvents.length > 1
                ? selectedEvents.map((_, index) => {
                      const startTime = document.getElementById(`startTime_${index}`)?.value;
                      const endTime = document.getElementById(`endTime_${index}`)?.value;

                      if (!startTime || !endTime) {
                          Swal.showValidationMessage('All times must be set');
                          return null;
                      }

                      return { startTime, endTime };
                  })
                : [{
                      startTime: document.getElementById('startTimePicker')?.value,
                      endTime: document.getElementById('endTimePicker')?.value,
                  }];

            if (inputTimes.includes(null)) return null;
            return inputTimes;
        },
    });

    if (times) {
        return selectedEvents.length > 1
            ? selectedEvents.map((event, index) => {
                  const { startTime, endTime } = times[index];

                  // Adjusting the start and end time
                  const adjustedStartTime = new Date(event.start); // Use event's start time
                  const adjustedEndTime = new Date(event.end); // Use event's end time

                  const [startHours, startMinutes] = startTime.split(':').map(Number);
                  const [endHours, endMinutes] = endTime.split(':').map(Number);

                  adjustedStartTime.setHours(startHours, startMinutes);
                  adjustedEndTime.setHours(endHours, endMinutes);

                  return { eventId: event._id, start: adjustedStartTime, end: adjustedEndTime };
              })
            : (() => {
                const { startTime, endTime } = times[0];

                // Adjusting the start and end time
                const adjustedStartTime = new Date(defaultStartTime);
                const adjustedEndTime = new Date(defaultEndTime);

                const [startHours, startMinutes] = startTime.split(':').map(Number);
                const [endHours, endMinutes] = endTime.split(':').map(Number);

                adjustedStartTime.setHours(startHours, startMinutes);
                adjustedEndTime.setHours(endHours, endMinutes);

                return { start: adjustedStartTime, end: adjustedEndTime };
            })();
    }

    return null;
};

export default promptForStartAndEndTime;