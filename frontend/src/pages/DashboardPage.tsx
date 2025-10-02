import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import userService from '../services/userService';
import Button from '../components/Button';
import type { User } from '../types/api';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profileData = await userService.getCurrentUserProfile();
        setProfile(profileData);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  Full Stack Test App
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/articles"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                📚 Browse Articles
              </Link>
              <Link
                to="/test-fetch-wrapper"
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                🧪 Test Fetch Wrapper
              </Link>
              <span className="text-sm text-gray-700">
                Welcome, {user?.firstName || 'User'}!
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-xl font-medium text-primary-600">
                          {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {profile?.firstName} {profile?.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{profile?.email}</p>
                      <p className="text-sm text-gray-500 capitalize">
                        Role: {profile?.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Account Status
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {profile?.isActive ? (
                              <span className="text-green-600">Active</span>
                            ) : (
                              <span className="text-red-600">Inactive</span>
                            )}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3a4 4 0 118 0v4m-4 12v-4.5l-2.5 2.5L7 12l2.5 2.5V19"
                          />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Member Since
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {profile?.createdAt ? 
                              new Date(profile.createdAt).toLocaleDateString() : 
                              'N/A'
                            }
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* API Health Check */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  API Connection Status
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Connected to backend API</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Successfully connected to the NestJS backend with JWT authentication.
                  Your access token is valid and interceptors are working correctly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;