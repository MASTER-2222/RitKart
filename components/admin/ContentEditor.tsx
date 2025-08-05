'use client';
import { useState } from 'react';

interface ContentEditorProps {
  title: string;
  content: string;
  placeholder: string;
  isTextarea?: boolean;
}

export default function ContentEditor({ title, content, placeholder, isTextarea = false }: ContentEditorProps) {
  const [value, setValue] = useState(content);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to your backend
    console.log('Saving content:', value);
  };

  const handleCancel = () => {
    setValue(content);
    setIsEditing(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">{title}</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap"
          >
            <i className="ri-edit-line w-4 h-4 flex items-center justify-center mr-1"></i>
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          {isTextarea ? (
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm whitespace-nowrap"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="text-gray-700">
          {isTextarea ? (
            <div className="whitespace-pre-wrap">{value}</div>
          ) : (
            <div>{value}</div>
          )}
        </div>
      )}
    </div>
  );
}