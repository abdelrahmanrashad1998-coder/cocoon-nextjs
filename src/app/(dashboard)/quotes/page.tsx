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
  FileText, 
  Plus, 
  Search, 
  Filter,
  Download,
  Edit,
  Trash,
  Eye,
  Calendar,
  DollarSign,
  User,
  Building
} from "lucide-react";

interface Quote {
  id: string;
  customerName: string;
  customerEmail: string;
  projectType: string;
  totalAmount: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  description: string;
}

export default function QuotesPage() {
  const { user, loading, isUserApproved, signOut } = useAuth();
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  // Form state for new quote
  const [newQuote, setNewQuote] = useState({
    customerName: "",
    customerEmail: "",
    projectType: "",
    description: "",
    totalAmount: 0,
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
    const mockQuotes: Quote[] = [
      {
        id: "1",
        customerName: "John Smith",
        customerEmail: "john@example.com",
        projectType: "Aluminum Windows",
        totalAmount: 2500,
        status: "approved",
        createdAt: "2024-01-15",
        description: "Installation of 6 aluminum windows for residential property"
      },
      {
        id: "2",
        customerName: "Sarah Johnson",
        customerEmail: "sarah@example.com",
        projectType: "Aluminum Doors",
        totalAmount: 1800,
        status: "pending",
        createdAt: "2024-01-20",
        description: "Replacement of front and back aluminum doors"
      },
      {
        id: "3",
        customerName: "Mike Wilson",
        customerEmail: "mike@example.com",
        projectType: "Aluminum Railings",
        totalAmount: 3200,
        status: "draft",
        createdAt: "2024-01-25",
        description: "Custom aluminum railings for balcony and staircase"
      }
    ];
    setQuotes(mockQuotes);
    setLoadingQuotes(false);
  }, []);

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.projectType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateQuote = () => {
    const quote: Quote = {
      id: Date.now().toString(),
      ...newQuote,
      status: "draft",
      createdAt: new Date().toISOString().split('T')[0]
    };
    setQuotes([quote, ...quotes]);
    setShowCreateModal(false);
    setNewQuote({
      customerName: "",
      customerEmail: "",
      projectType: "",
      description: "",
      totalAmount: 0,
    });
  };

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowViewModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || loadingQuotes) {
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
            <h1 className="text-3xl font-bold text-[#303038]">Quote Management</h1>
            <p className="text-gray-600">Create and manage customer quotes</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={20} />
            Create Quote
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search quotes..."
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
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Quotes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuotes.map((quote) => (
            <Card key={quote.id} className="p-6 hover:transform hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#303038]">{quote.customerName}</h3>
                  <p className="text-sm text-gray-600">{quote.customerEmail}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(quote.status)}`}>
                  {quote.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <Building size={16} className="inline mr-1" />
                  {quote.projectType}
                </p>
                <p className="text-sm text-gray-600">
                  <Calendar size={16} className="inline mr-1" />
                  {quote.createdAt}
                </p>
                <p className="text-lg font-bold text-[#A72036]">
                  <DollarSign size={16} className="inline mr-1" />
                  ${quote.totalAmount.toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleViewQuote(quote)}
                >
                  <Eye size={16} />
                  View
                </Button>
                <Button size="sm" variant="secondary">
                  <Edit size={16} />
                  Edit
                </Button>
                <Button size="sm" variant="secondary">
                  <Download size={16} />
                  Export
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredQuotes.length === 0 && (
          <Card className="p-12 text-center">
            <FileText size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No quotes found</h3>
            <p className="text-gray-500">Create your first quote to get started</p>
          </Card>
        )}
      </div>

      {/* Create Quote Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Quote"
      >
        <div className="space-y-4">
          <Input
            label="Customer Name"
            value={newQuote.customerName}
            onChange={(e) => setNewQuote({...newQuote, customerName: e.target.value})}
            placeholder="Enter customer name"
          />
          <Input
            label="Customer Email"
            type="email"
            value={newQuote.customerEmail}
            onChange={(e) => setNewQuote({...newQuote, customerEmail: e.target.value})}
            placeholder="Enter customer email"
          />
          <Input
            label="Project Type"
            value={newQuote.projectType}
            onChange={(e) => setNewQuote({...newQuote, projectType: e.target.value})}
            placeholder="e.g., Aluminum Windows, Doors, Railings"
          />
          <Input
            label="Description"
            value={newQuote.description}
            onChange={(e) => setNewQuote({...newQuote, description: e.target.value})}
            placeholder="Project description"
          />
          <Input
            label="Total Amount"
            type="number"
            value={newQuote.totalAmount}
            onChange={(e) => setNewQuote({...newQuote, totalAmount: parseFloat(e.target.value) || 0})}
            placeholder="0.00"
          />
          
          <div className="flex gap-4 pt-4">
            <Button onClick={handleCreateQuote} className="flex-1">
              Create Quote
            </Button>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Quote Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Quote Details"
      >
        {selectedQuote && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Customer</label>
                <p className="text-lg">{selectedQuote.customerName}</p>
                <p className="text-sm text-gray-600">{selectedQuote.customerEmail}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Status</label>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedQuote.status)}`}>
                  {selectedQuote.status}
                </span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-600">Project Type</label>
              <p className="text-lg">{selectedQuote.projectType}</p>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-600">Description</label>
              <p className="text-gray-700">{selectedQuote.description}</p>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-600">Total Amount</label>
              <p className="text-2xl font-bold text-[#A72036]">${selectedQuote.totalAmount.toLocaleString()}</p>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-600">Created</label>
              <p className="text-gray-700">{selectedQuote.createdAt}</p>
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button className="flex-1">
                <Download size={16} />
                Export PDF
              </Button>
              <Button variant="secondary" className="flex-1">
                <Edit size={16} />
                Edit Quote
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
