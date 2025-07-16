import FormInput from './formInput';
import {SelectInput,SelectTaskPeriodInput} from './selectInput';
import RichTextEditor from './richTextEditor';
const DateTimeWithAdjust = ({ label, name, value, onChange }) => {
    const adjustTime = (hours) => {
      let dateValue;
  
      try {
        // Parse the value into a Date object
        dateValue = value ? new Date(value) : new Date();
      } catch {
        // Fallback to current date if parsing fails
        dateValue = new Date();
      }
  
      // Adjust the time by the specified number of hours
      const newDate = new Date(dateValue);
      newDate.setHours(newDate.getHours() + hours);
  
      // Format the adjusted date to match the input type `datetime-local`
      const formattedDate = formatDateForInput(newDate);
  
      // Trigger the onChange event with the updated value
      onChange({ target: { name, value: formattedDate } });
    };
  
    // Helper function to format date for `datetime-local` input
    const formatDateForInput = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
  
    return (
        <div className="flex items-center">
          <FormInput
            label={label}
            name={name}
            type="datetime-local"
            value={value}
            onChange={onChange}
            required
          />
          <div className="flex flex-col items-center space-y-1">
            <button
              type="button"
              onClick={() => adjustTime(1)} // Increase time by 1 hour
              className="w-6 h-6 text-white bg-blue-400 hover:bg-blue-500 rounded-full flex items-center justify-center"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => adjustTime(-1)} // Decrease time by 1 hour
              className="w-6 h-6 text-white bg-blue-400 hover:bg-blue-500 rounded-full flex items-center justify-center"
            >
              ↓
            </button>
          </div>
        </div>
      );
    };
const DynamicFormField = ({ field, value, onChange, options }) => {
 
  const selectOptions = options || field.options || [];
  
    switch (field.fieldType) {
      case 'text':
        return (
          <FormInput
            label={field.displayName}
            name={field.fieldName}
            value={value}
            onChange={onChange}
            required={field.required}
          />
        );
      case 'select':
        
        return (
          <SelectInput
            label={field.displayName}
            name={field.fieldName}
            value={value}
            onChange={onChange}
            options={selectOptions}
            isMulti={field.multiple}
            required={field.required}
          />
        );
      case 'datetime':
        return (
          <DateTimeWithAdjust
            label={field.displayName}
            name={field.fieldName}
            value={value}
            onChange={onChange}
          />
        );
      case 'richtext':
        return (
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              {field.displayName}
            </label>
            <RichTextEditor value={value} onChange={onChange} />
          </div>
        );
      default:
        return (
          <FormInput
            label={field.displayName}
            name={field.fieldName}
            value={value}
            onChange={onChange}
            required={field.required}
          />
        );
    }
  };
  export default DynamicFormField;