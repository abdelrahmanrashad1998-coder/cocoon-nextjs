"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { 
  Users, 
  Plus, 
  Search, 
  Shield,
  Edit,
  Trash,
  Eye,
  Calendar,
  Mail,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Crown,
  FileText
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user' | 'pending';
  status: 'active' | 'inactive' | 'pending_approval';
  createdAt: string;
  lastLogin: string;
  totalQuotes: number;
  totalRevenue: number;
}

export default function AdminPage() {
  const { user, loading, isUserApproved, signOut } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Form state for new user
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user" as 'admin' | 'manager' | 'user',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && !isUserApproved) {
      router.push("/dashboard");
      return;
    }
  }, [user, loading, isUserApproved, router]);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  // Mock data for demonstration
  useEffect(() => {
    const mockUsers: AdminUser[] = [
      {
        id: "1",
        name: "Admin User",
        email: "admin@cocoon.com",
        role: "admin",
        status: "active",
        createdAt: "2024-01-01",
        lastLogin: "2024-01-30",
        totalQuotes: 25,
        totalRevenue: 45000
      },
      {
        id: "2",
        name: "Manager User",
        email: "manager@cocoon.com",
        role: "manager",
        status: "active",
        createdAt: "2024-01-05",
        lastLogin: "2024-01-29",
        totalQuotes: 15,
        totalRevenue: 28000
      },
      {
        id: "3",
        name: "Regular User",
        email: "user@cocoon.com",
        role: "user",
        status: "active",
        createdAt: "2024-01-10",
        lastLogin: "2024-01-28",
        totalQuotes: 8,
        totalRevenue: 12000
      },
      {
        id: "4",
        name: "Pending User",
        email: "pending@cocoon.com",
        role: "pending",
        status: "pending_approval",
        createdAt: "2024-01-25",
        lastLogin: "Never",
        totalQuotes: 0,
        totalRevenue: 0
      }
    ];
    setUsers(mockUsers);
    setLoadingUsers(false);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = () => {
    const user: AdminUser = {
      id: Date.now().toString(),
      ...newUser,
      status: "active",
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: "Never",
      totalQuotes: 0,
      totalRevenue: 0
    };
    setUsers([user, ...users]);
    setShowCreateModal(false);
    setNewUser({
      name: "",
      email: "",
      role: "user",
    });
  };

  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleApproveUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, role: 'user', status: 'active' }
        : user
    ));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-orange-100 text-orange-800';
      case 'user': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || loadingUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A72036] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#303038]">User Management</h1>
            <p className="text-gray-600">Manage system users and permissions</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={20} />
            Add User
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:border-[#A72036]"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="p-6 hover:transform hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#303038]">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <Calendar size={16} className="inline mr-1" />
                  Joined: {user.createdAt}
                </p>
                <p className="text-sm text-gray-600">
                  <Clock size={16} className="inline mr-1" />
                  Last login: {user.lastLogin}
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    <FileText size={16} className="inline mr-1" />
                    {user.totalQuotes} quotes
                  </span>
                  <span className="font-semibold text-[#A72036]">
                    ${user.totalRevenue.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleViewUser(user)}
                >
                  <Eye size={16} />
                  View
                </Button>
                {user.role === 'pending' && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleApproveUser(user.id)}
                  >
                    <CheckCircle size={16} />
                    Approve
                  </Button>
                )}
                <Button size="sm" variant="secondary">
                  <Edit size={16} />
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="p-12 text-center">
            <Users size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No users found</h3>
            <p className="text-gray-500">Add your first user to get started</p>
          </Card>
        )}
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New User"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={newUser.name}
            onChange={(e) => setNewUser({...newUser, name: e.target.value})}
            placeholder="Enter user name"
          />
          <Input
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            placeholder="Enter email address"
          />
          <div>
            <label className="block mb-2 text-sm font-semibold text-[#303038]">Role</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value as 'admin' | 'manager' | 'user'})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:border-[#A72036]"
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button onClick={handleCreateUser} className="flex-1">
              Add User
            </Button>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* View User Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="User Details"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Name</label>
                <p className="text-lg">{selectedUser.name}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Email</label>
                <p className="text-lg">{selectedUser.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Role</label>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(selectedUser.role)}`}>
                  {selectedUser.role}
                </span>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Status</label>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedUser.status)}`}>
                  {selectedUser.status}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Total Quotes</label>
                <p className="text-2xl font-bold text-[#A72036]">{selectedUser.totalQuotes}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Total Revenue</label>
                <p className="text-2xl font-bold text-[#A72036]">${selectedUser.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-600">Joined</label>
              <p className="text-gray-700">{selectedUser.createdAt}</p>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-600">Last Login</label>
              <p className="text-gray-700">{selectedUser.lastLogin}</p>
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button className="flex-1">
                <Edit size={16} />
                Edit User
              </Button>
              {selectedUser.role === 'pending' && (
                <Button variant="success" className="flex-1">
                  <CheckCircle size={16} />
                  Approve User
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
