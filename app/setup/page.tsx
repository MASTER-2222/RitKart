'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function DatabaseSetup() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [schemaContent, setSchemaContent] = useState('')

  const testConnection = async () => {
    setStatus('testing')
    setMessage('Testing database connection...')

    try {
      const response = await fetch('/api/setup')
      const data = await response.json()

      if (data.success) {
        setStatus('success')
        setMessage('✅ Database is set up and working correctly!')
      } else {
        setStatus('error')
        setMessage(data.message || 'Database setup required')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Failed to test connection: ' + (error as Error).message)
    }
  }

  const loadSchema = async () => {
    try {
      const response = await fetch('/database-schema.sql')
      const sql = await response.text()
      setSchemaContent(sql)
    } catch (error) {
      console.error('Failed to load schema:', error)
      setMessage('Failed to load schema file')
    }
  }

  const copySchema = () => {
    navigator.clipboard.writeText(schemaContent)
    setMessage('Schema copied to clipboard! Now paste it in Supabase SQL Editor.')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🚀 RitZone Database Setup
          </h1>
          <p className="text-lg text-gray-600">
            Set up your Supabase database schema for the RitZone e-commerce platform
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Database Connection Test</h2>
          
          <button
            onClick={testConnection}
            disabled={status === 'testing'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {status === 'testing' ? 'Testing...' : 'Test Database Connection'}
          </button>

          {message && (
            <div className={`p-4 rounded-lg ${
              status === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : status === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {message}
            </div>
          )}
        </div>

        {status === 'error' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Database Setup Required</h2>
            
            <div className="space-y-4 mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Setup Instructions:</h3>
                <ol className="list-decimal list-inside text-yellow-700 space-y-1">
                  <li>Go to your <a href="https://igzpodmmymbptmwebonh.supabase.co" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Supabase project</a></li>
                  <li>Navigate to the <strong>SQL Editor</strong> section</li>
                  <li>Click the button below to load and copy the database schema</li>
                  <li>Paste the schema in Supabase SQL Editor and execute it</li>
                  <li>Return here and test the connection again</li>
                </ol>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={loadSchema}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Load Database Schema
                </button>

                {schemaContent && (
                  <button
                    onClick={copySchema}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    Copy Schema to Clipboard
                  </button>
                )}
              </div>

              {schemaContent && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Database Schema Preview:</h3>
                  <div className="bg-gray-100 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {schemaContent.substring(0, 1000)}...
                      {schemaContent.length > 1000 && (
                        <div className="text-gray-500 mt-2">
                          [Schema truncated - {schemaContent.length} total characters]
                        </div>
                      )}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-green-800">🎉 Database Ready!</h2>
            <p className="text-gray-600 mb-4">
              Your Supabase database is properly configured and ready for the RitZone application.
            </p>
            <div className="space-y-2">
              <p><strong>Next Steps:</strong></p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Set up user authentication</li>
                <li>Import product data from static files</li>
                <li>Test the complete e-commerce functionality</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}