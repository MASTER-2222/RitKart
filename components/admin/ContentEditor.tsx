'use client';
import { useState } from 'react';
import apiClient from '../../utils/api';

interface ContentEditorProps {
  title: string;
  content: string;
  placeholder: string;
  isTextarea?: boolean;
  sectionName?: string;
  contentKey?: string;
  onSave?: (value: string) => void;
}

export default function ContentEditor({ 
  title, 
  content, 
  placeholder, 
  isTextarea = false, 
  sectionName,
  contentKey,
  onSave 
}: ContentEditorProps) {
  const [value, setValue] = useState(content);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>('');

  const handleSave = async () => {
    if (!sectionName || !contentKey) {
      console.error('sectionName and contentKey are required for saving');
      setSaveMessage('❌ Configuration error');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      // Call the backend API to update content
      const result = await apiClient.updateHomepageContent(sectionName, {
        [contentKey]: value
      });

      if (result.success) {
        setIsEditing(false);
        setSaveMessage('✅ Saved successfully');
        onSave?.(value);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage(`❌ ${result.message || 'Save failed'}`);
      }
    } catch (error) {
      console.error('Content save error:', error);
      setSaveMessage('❌ Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(content);
    setIsEditing(false);
    setSaveMessage('');
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          {saveMessage && (
            <span className={`text-sm ${saveMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
              {saveMessage}
            </span>
          )}
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
              disabled={isSaving}
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            />
          )}
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm whitespace-nowrap"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm whitespace-nowrap disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
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