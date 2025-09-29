import React, { useState } from 'react';
import { fetchWrapper } from '../utils/fetchWrapper';

const FetchWrapperTestPage: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (method: string, url: string, result: any, requestId?: string) => {
    setResults(prev => [{
      id: Date.now(),
      method,
      url,
      result,
      requestId,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev]);
  };

  const testEcho = async () => {
    setLoading(true);
    try {
      const response = await fetchWrapper.get<{requestId: string, x: string}>('/demo/echo?x=test-from-wrapper');
      addResult('GET', '/demo/echo', response, response.data?.requestId);
    } catch (error) {
      addResult('GET', '/demo/echo', { error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testPagination = async () => {
    setLoading(true);
    try {
      const response = await fetchWrapper.get<{requestId: string, items: any[], pagination: any}>('/demo/items?limit=3');
      addResult('GET', '/demo/items', response, response.data?.requestId);
    } catch (error) {
      addResult('GET', '/demo/items', { error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testPayments = async () => {
    setLoading(true);
    try {
      const response = await fetchWrapper.post<{requestId?: string, paymentId: string}>('/payments', 
        { amount: 99, currency: 'USD' },
        { headers: { 'Idempotency-Key': `test-${Date.now()}` } }
      );
      addResult('POST', '/payments', response, response.data?.requestId);
    } catch (error) {
      addResult('POST', '/payments', { error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testProfile = async () => {
    setLoading(true);
    try {
      const response = await fetchWrapper.get<{requestId?: string, id: number, email: string}>('/users/profile');
      addResult('GET', '/users/profile', response, response.data?.requestId);
    } catch (error) {
      addResult('GET', '/users/profile', { error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testNoAuth = async () => {
    setLoading(true);
    try {
      const response = await fetchWrapper.get<{requestId: string, x: string}>('/demo/echo?x=no-auth', { includeAuth: false });
      addResult('GET', '/demo/echo (no auth)', response, response.data?.requestId);
    } catch (error) {
      addResult('GET', '/demo/echo (no auth)', { error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧪 Fetch Wrapper Test Page
          </h1>
          <p className="text-gray-600">
            Test the custom fetch wrapper with x-request-id UUID and Authorization headers
          </p>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Endpoints</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={testEcho}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Test Echo
            </button>
            
            <button
              onClick={testPagination}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Test Pagination
            </button>
            
            <button
              onClick={testPayments}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              Test Payments
            </button>
            
            <button
              onClick={testProfile}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
              Test Profile (Auth)
            </button>
            
            <button
              onClick={testNoAuth}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Test No Auth
            </button>
            
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Clear Results
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">
              Test Results ({results.length})
            </h2>
          </div>
          
          <div className="p-6">
            {results.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No test results yet. Click a test button above to start testing.
              </div>
            ) : (
              <div className="space-y-4">
                {results.map(result => (
                  <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          result.method === 'GET' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {result.method}
                        </span>
                        <span className="font-medium text-gray-900">{result.url}</span>
                        {result.requestId && (
                          <span className="text-xs text-gray-500">
                            ID: {result.requestId.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{result.timestamp}</span>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-3 overflow-x-auto">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(result.result, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FetchWrapperTestPage;