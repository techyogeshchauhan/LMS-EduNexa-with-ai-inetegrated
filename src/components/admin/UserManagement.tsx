import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  Search,
  Plus,
  Edit,
  Eye,
  RefreshCw,
  Shield,
  GraduationCap,
  BookOpen,
  Trash2,
  Lock,
  Unlock,
  Key
} from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin' | 'super_admin';
  department?: string;
  year?: string;
  roll_no?: string;
  employee_id?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (searchTerm) params.append('search', searchTerm);
      params.append('page', '1');
      params.append('limit', '50');

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const url = `http://localhost:5000/api/users?${params.toString()}`;
      console.log('Fetching users from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        } else if (response.status === 404) {
          throw new Error('API endpoint not found. Check backend configuration.');
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('Users data received:', data);

      // Check if the response has the expected structure
      if (data.users && Array.isArray(data.users)) {
        setUsers(data.users);
      } else if (Array.isArray(data)) {
        // Handle case where response is directly an array
        setUsers(data);
      } else {
        console.warn('Unexpected response structure:', data);
        setUsers([]);
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);

      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        setError('Cannot connect to server. Please check if the backend is running on http://localhost:5000');
      } else {
        setError(err.message || 'An unexpected error occurred while fetching users.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && ['admin', 'super_admin'].includes(currentUser.role)) {
      fetchUsers();
    }
  }, [currentUser, roleFilter, searchTerm]);

  // Test backend connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        // Use the correct health endpoint from API_ENDPOINTS
        const healthData = await fetch('http://localhost:5000/api/health', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (healthData.ok) {
          const data = await healthData.json();
          console.log('Backend connection successful:', data.message);
        } else {
          throw new Error(`Health check failed: ${healthData.status}`);
        }
      } catch (err) {
        console.error('Backend connection failed:', err);
        setError('Cannot connect to backend server. Please ensure it is running on http://localhost:5000');
      }
    };

    if (currentUser && ['admin', 'super_admin'].includes(currentUser.role)) {
      testConnection();
    }
  }, [currentUser]);

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate') => {
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      const url = `http://localhost:5000/api/users/${userId}/${action}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        await fetchUsers(); // Refresh the user list
        alert(result.message || `User ${action}d successfully`);
      } else {
        let errorMessage = `Failed to ${action} user`;

        if (response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. Admin privileges required.';
        } else if (response.status === 400) {
          errorMessage = 'Cannot perform this action on the selected user.';
        } else if (response.status === 404) {
          errorMessage = 'User not found.';
        } else {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = `Server error (${response.status})`;
          }
        }

        alert(errorMessage);
      }
    } catch (err: any) {
      console.error(`Error ${action}ing user:`, err);
      alert(`Error: Cannot connect to server. Please check if the backend is running.`);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to DELETE user "${userName}"? This action cannot be undone!`)) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      const url = `http://localhost:5000/api/users/${userId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        await fetchUsers(); // Refresh the user list
        alert('User deleted successfully');
      } else {
        let errorMessage = 'Failed to delete user';

        if (response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. Super admin privileges required.';
        } else if (response.status === 404) {
          errorMessage = 'User not found.';
        } else {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = `Server error (${response.status})`;
          }
        }

        alert(errorMessage);
      }
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert(`Error: Cannot connect to server. Please check if the backend is running.`);
    }
  };

  const handleResetPassword = async (userId: string, userName: string) => {
    const newPassword = prompt(`Enter new password for ${userName}:`);
    if (!newPassword) return;

    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      const url = `http://localhost:5000/api/users/${userId}/reset-password`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ new_password: newPassword })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'Password reset successfully');
      } else {
        let errorMessage = 'Failed to reset password';

        if (response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. Admin privileges required.';
        } else if (response.status === 404) {
          errorMessage = 'User not found.';
        } else {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = `Server error (${response.status})`;
          }
        }

        alert(errorMessage);
      }
    } catch (err: any) {
      console.error('Error resetting password:', err);
      alert(`Error: Cannot connect to server. Please check if the backend is running.`);
    }
  };

  const handleEditUser = (userId: string) => {
    // For now, just show an alert. You can implement a modal or navigate to edit page
    alert(`Edit user functionality will be implemented. User ID: ${userId}`);
  };

  const handleViewUser = (userId: string) => {
    // For now, just show an alert. You can implement a modal or navigate to view page
    alert(`View user details functionality will be implemented. User ID: ${userId}`);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return <GraduationCap className="h-4 w-4 text-blue-600" />;
      case 'teacher': return <BookOpen className="h-4 w-4 text-green-600" />;
      case 'admin': return <Shield className="h-4 w-4 text-orange-600" />;
      case 'super_admin': return <Shield className="h-4 w-4 text-purple-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-orange-100 text-orange-800';
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!currentUser || !['admin', 'super_admin'].includes(currentUser.role)) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Access denied. Admin privileges required.</p>
          <div className="mt-2 text-sm text-red-600">
            <p>Current user role: {currentUser?.role || 'Not logged in'}</p>
            <p>Token exists: {localStorage.getItem('access_token') ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              window.history.pushState({}, '', '/dashboard');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage all users, roles, and permissions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const response = await fetch('http://localhost:5000/api/health', {
                  method: 'GET',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  }
                });

                if (response.ok) {
                  const data = await response.json();
                  alert(`Backend Status: ${data.status}\nMessage: ${data.message}\nTimestamp: ${data.timestamp}`);
                } else {
                  alert(`Backend connection failed: HTTP ${response.status}`);
                }
              } catch (err: any) {
                alert(`Backend connection failed: ${err.message || 'Cannot reach server'}`);
              }
            }}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Test Connection
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Debug Info Panel - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
          <h3 className="font-medium text-yellow-800 mb-2">Debug Information:</h3>
          <div className="grid grid-cols-2 gap-4 text-yellow-700">
            <div>Current User: {currentUser?.name || 'Not loaded'}</div>
            <div>User Role: {currentUser?.role || 'Unknown'}</div>
            <div>Token Exists: {localStorage.getItem('access_token') ? 'Yes' : 'No'}</div>
            <div>Backend URL: http://localhost:5000</div>
            <div>Users Loaded: {users.length}</div>
            <div>Environment: {process.env.NODE_ENV || 'development'}</div>
          </div>
        </div>
      )}

      {/* User Statistics */}
      {!loading && !error && users.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'student').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Teachers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'teacher').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Admins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => ['admin', 'super_admin'].includes(u.role)).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="admin">Admins</option>
            <option value="super_admin">Super Admins</option>
          </select>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-800 font-medium">{error}</p>
                {error.includes('Cannot connect to server') && (
                  <div className="mt-2 text-sm text-red-700">
                    <p className="font-medium">To start the backend server:</p>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>Open a terminal in the <code className="bg-red-100 px-1 rounded">backend</code> directory</li>
                      <li>Install dependencies: <code className="bg-red-100 px-1 rounded">pip install -r requirements.txt</code></li>
                      <li>Start the server: <code className="bg-red-100 px-1 rounded">python run.py</code></li>
                      <li>Ensure MongoDB is running (required for the backend)</li>
                      <li>Server should start on <code className="bg-red-100 px-1 rounded">http://localhost:5000</code></li>
                    </ol>
                  </div>
                )}
              </div>
              <button
                onClick={fetchUsers}
                className="text-red-600 hover:text-red-800 text-sm underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">Loading users...</p>
            <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No users found. {searchTerm || roleFilter ? 'Try adjusting your search criteria.' : 'Start by adding some users.'}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getRoleIcon(user.role)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                            {user.role.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.department || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleViewUser(user._id)}
                            className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditUser(user._id)}
                            className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleResetPassword(user._id, user.name)}
                            className="p-1 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded"
                            title="Reset Password"
                          >
                            <Key className="h-4 w-4" />
                          </button>
                          {user.is_active ? (
                            <button
                              onClick={() => handleUserAction(user._id, 'deactivate')}
                              className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                              title="Block/Deactivate User"
                            >
                              <Lock className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserAction(user._id, 'activate')}
                              className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded"
                              title="Unblock/Activate User"
                            >
                              <Unlock className="h-4 w-4" />
                            </button>
                          )}
                          {currentUser?.role === 'super_admin' && (
                            <button
                              onClick={() => handleDeleteUser(user._id, user.name)}
                              className="p-1 text-red-700 hover:text-red-900 hover:bg-red-50 rounded"
                              title="Delete User (Super Admin Only)"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;