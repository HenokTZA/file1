// src/components/RichTextEditor.js
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange }) => {
  return (
    <div className="mb-4 w-full">
      <ReactQuill 
        value={value} 
        onChange={onChange} 
        modules={{
          toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['link',  'blockquote', 'code-block'],
            ['clean']
          ]
        }}
        className="min-h-[250px] bg-gray-50 sm:min-h-[200px] md:min-h-[100px] lg:min-h-[150px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
};

export default RichTextEditor;
