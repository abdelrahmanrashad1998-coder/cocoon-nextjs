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
  Download,
  Edit,
  Trash,
  Eye,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building,
  User,
  FileText
} from "lucide-react";

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  createdAt: string;
  totalQuotes: number;
  totalSpent: number;
  status: 'active' | 'inactive';
}

export default function ProfilesPage() {
  const { user, loading, isUserApproved, signOut } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // Form state for new profile
  const [newProfile, setNewProfile] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
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
    const mockProfiles: Profile[] = [
      {
        id: "1",
        name: "John Smith",
        email: "john@example.com",
        phone: "(555) 123-4567",
        company: "Smith Construction",
        address: "123 Main St",
        city: "Anytown",
        state: "CA",
        zipCode: "90210",
        createdAt: "2024-01-15",
        totalQuotes: 5,
        totalSpent: 12500,
        status: "active"
      },
      {
        id: "2",
        name: "Sarah Johnson",
        email: "sarah@example.com",
        phone: "(555) 987-6543",
        company: "Johnson Properties",
        address: "456 Oak Ave",
        city: "Somewhere",
        state: "NY",
        zipCode: "10001",
        createdAt: "2024-01-20",
        totalQuotes: 3,
        totalSpent: 8500,
        status: "active"
      },
      {
        id: "3",
        name: "Mike Wilson",
        email: "mike@example.com",
        phone: "(555) 456-7890",
        company: "Wilson Development",
        address: "789 Pine Rd",
        city: "Elsewhere",
        state: "TX",
        zipCode: "75001",
        createdAt: "2024-01-25",
        totalQuotes: 2,
        totalSpent: 4200,
        status: "inactive"
      }
    ];
    setProfiles(mockProfiles);
    setLoadingProfiles(false);
  }, []);

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || profile.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateProfile = () => {
    const profile: Profile = {
      id: Date.now().toString(),
      ...newProfile,
      createdAt: new Date().toISOString().split('T')[0],
      totalQuotes: 0,
      totalSpent: 0,
      status: "active"
    };
    setProfiles([profile, ...profiles]);
    setShowCreateModal(false);
    setNewProfile({
      name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    });
  };

  const handleViewProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setShowViewModal(true);
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  if (loading || loadingProfiles) {
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
            <h1 className="text-3xl font-bold text-[#303038]">Customer Profiles</h1>
            <p className="text-gray-600">Manage customer information and history</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={20} />
            Add Customer
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:border-[#A72036]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <Card key={profile.id} className="p-6 hover:transform hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#303038]">{profile.name}</h3>
                  <p className="text-sm text-gray-600">{profile.company}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(profile.status)}`}>
                  {profile.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <Mail size={16} className="inline mr-1" />
                  {profile.email}
                </p>
                <p className="text-sm text-gray-600">
                  <Phone size={16} className="inline mr-1" />
                  {profile.phone}
                </p>
                <p className="text-sm text-gray-600">
                  <MapPin size={16} className="inline mr-1" />
                  {profile.city}, {profile.state}
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    <FileText size={16} className="inline mr-1" />
                    {profile.totalQuotes} quotes
                  </span>
                  <span className="font-semibold text-[#A72036]">
                    ${profile.totalSpent.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleViewProfile(profile)}
                >
                  <Eye size={16} />
                  View
                </Button>
                <Button size="sm" variant="secondary">
                  <Edit size={16} />
                  Edit
                </Button>
                <Button size="sm" variant="secondary">
                  <FileText size={16} />
                  Quotes
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredProfiles.length === 0 && (
          <Card className="p-12 text-center">
            <Users size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No customers found</h3>
            <p className="text-gray-500">Add your first customer to get started</p>
          </Card>
        )}
      </div>

      {/* Create Profile Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Customer"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={newProfile.name}
            onChange={(e) => setNewProfile({...newProfile, name: e.target.value})}
            placeholder="Enter customer name"
          />
          <Input
            label="Email"
            type="email"
            value={newProfile.email}
            onChange={(e) => setNewProfile({...newProfile, email: e.target.value})}
            placeholder="Enter email address"
          />
          <Input
            label="Phone"
            value={newProfile.phone}
            onChange={(e) => setNewProfile({...newProfile, phone: e.target.value})}
            placeholder="Enter phone number"
          />
          <Input
            label="Company"
            value={newProfile.company}
            onChange={(e) => setNewProfile({...newProfile, company: e.target.value})}
            placeholder="Enter company name"
          />
          <Input
            label="Address"
            value={newProfile.address}
            onChange={(e) => setNewProfile({...newProfile, address: e.target.value})}
            placeholder="Enter street address"
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="City"
              value={newProfile.city}
              onChange={(e) => setNewProfile({...newProfile, city: e.target.value})}
              placeholder="City"
            />
            <Input
              label="State"
              value={newProfile.state}
              onChange={(e) => setNewProfile({...newProfile, state: e.target.value})}
              placeholder="State"
            />
            <Input
              label="ZIP Code"
              value={newProfile.zipCode}
              onChange={(e) => setNewProfile({...newProfile, zipCode: e.target.value})}
              placeholder="ZIP"
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button onClick={handleCreateProfile} className="flex-1">
              Add Customer
            </Button>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Profile Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Customer Details"
      >
        {selectedProfile && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Name</label>
                <p className="text-lg">{selectedProfile.name}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Status</label>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedProfile.status)}`}>
                  {selectedProfile.status}
                </span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-600">Company</label>
              <p className="text-lg">{selectedProfile.company}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Email</label>
                <p className="text-gray-700">{selectedProfile.email}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Phone</label>
                <p className="text-gray-700">{selectedProfile.phone}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-600">Address</label>
              <p className="text-gray-700">
                {selectedProfile.address}<br />
                {selectedProfile.city}, {selectedProfile.state} {selectedProfile.zipCode}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Total Quotes</label>
                <p className="text-2xl font-bold text-[#A72036]">{selectedProfile.totalQuotes}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Total Spent</label>
                <p className="text-2xl font-bold text-[#A72036]">${selectedProfile.totalSpent.toLocaleString()}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-600">Customer Since</label>
              <p className="text-gray-700">{selectedProfile.createdAt}</p>
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button className="flex-1">
                <FileText size={16} />
                View Quotes
              </Button>
              <Button variant="secondary" className="flex-1">
                <Edit size={16} />
                Edit Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
