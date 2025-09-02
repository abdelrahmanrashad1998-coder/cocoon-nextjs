"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  BarChart3, 
  FileText, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock,
  AlertCircle,
  CheckCircle,
  Plus
} from "lucide-react";

interface DashboardStats {
  totalQuotes: number;
  totalProfiles: number;
  totalUsers: number;
  totalRevenue: number;
  pendingQuotes: number;
  approvedQuotes: number;
}

export default function DashboardPage() {
  const { user, loading, isUserApproved, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalQuotes: 0,
    totalProfiles: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingQuotes: 0,
    approvedQuotes: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && !isUserApproved) {
      // Show pending approval message
      return;
    }
  }, [user, loading, isUserApproved]);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A72036] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isUserApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#A72036] to-[#F9BC77]">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h2 className="text-2xl font-bold text-[#A72036] mb-4">
            Account Pending Approval
          </h2>
                                <p className="text-gray-600 mb-6">
                        Your account has been created successfully, but it&apos;s currently pending approval from an administrator.
                        <br /><br />
                        You&apos;ll be able to access all features once your account is approved.
                      </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleLogout} variant="primary">
              Logout
            </Button>
            <Button onClick={() => window.location.reload()} variant="secondary">
              Check Status
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#303038] mb-2">
            Welcome to Cocoon Aluminum Works
          </h1>
          <p className="text-xl text-gray-600">
            Professional aluminum solutions and quote management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 text-center hover:transform hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-[#A72036] rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-[#303038] mb-2">Total Quotes</h3>
            <p className="text-3xl font-bold text-[#A72036]">{stats.totalQuotes}</p>
            <p className="text-sm text-gray-600 mt-2">Quotes created</p>
          </Card>

          <Card className="p-6 text-center hover:transform hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-[#F9BC77] rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-[#303038] mb-2">Customer Profiles</h3>
            <p className="text-3xl font-bold text-[#F9BC77]">{stats.totalProfiles}</p>
            <p className="text-sm text-gray-600 mt-2">Active customers</p>
          </Card>

          <Card className="p-6 text-center hover:transform hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <DollarSign className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-[#303038] mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-2">From approved quotes</p>
          </Card>

          <Card className="p-6 text-center hover:transform hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-[#303038] mb-2">Pending Quotes</h3>
            <p className="text-3xl font-bold text-yellow-500">{stats.pendingQuotes}</p>
            <p className="text-sm text-gray-600 mt-2">Awaiting approval</p>
          </Card>

          <Card className="p-6 text-center hover:transform hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-[#303038] mb-2">Approved Quotes</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.approvedQuotes}</p>
            <p className="text-sm text-gray-600 mt-2">Ready for production</p>
          </Card>

          <Card className="p-6 text-center hover:transform hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-[#303038] mb-2">Conversion Rate</h3>
            <p className="text-3xl font-bold text-purple-600">
              {stats.totalQuotes > 0 ? Math.round((stats.approvedQuotes / stats.totalQuotes) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-600 mt-2">Quote to approval</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-[#303038] mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Button 
                          onClick={() => router.push("/quote-generator")}
                          className="h-16 text-lg"
                        >
                          <Plus size={20} />
                          Create New Quote
                        </Button>
            <Button 
              onClick={() => router.push("/profiles")}
              variant="secondary"
              className="h-16 text-lg"
            >
              <Users size={20} />
              Manage Profiles
            </Button>
            <Button 
              onClick={() => router.push("/admin")}
              variant="secondary"
              className="h-16 text-lg"
            >
              <BarChart3 size={20} />
              Admin Panel
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
