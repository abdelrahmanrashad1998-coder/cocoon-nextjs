import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { LogOut, User, Settings, BarChart3, FileText, Users, Plus } from "lucide-react";

interface HeaderProps {
  user?: {
    email?: string | null;
    displayName?: string | null;
  };
  onLogout?: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#A72036] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#303038]">Cocoon Aluminum Works</h1>
                <p className="text-sm text-gray-600">Professional Aluminum Solutions</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-2 text-gray-700 hover:text-[#A72036] transition-colors"
            >
              <BarChart3 size={20} />
              <span>Dashboard</span>
            </Link>
                                    <Link 
                          href="/quotes" 
                          className="flex items-center space-x-2 text-gray-700 hover:text-[#A72036] transition-colors"
                        >
                          <FileText size={20} />
                          <span>Quotes</span>
                        </Link>
                        <Link 
                          href="/quote-generator" 
                          className="flex items-center space-x-2 text-gray-700 hover:text-[#A72036] transition-colors"
                        >
                          <Plus size={20} />
                          <span>New Quote</span>
                        </Link>
            <Link 
              href="/profiles" 
              className="flex items-center space-x-2 text-gray-700 hover:text-[#A72036] transition-colors"
            >
              <User size={20} />
              <span>Profiles</span>
            </Link>
            <Link 
              href="/admin" 
              className="flex items-center space-x-2 text-gray-700 hover:text-[#A72036] transition-colors"
            >
              <Users size={20} />
              <span>Admin</span>
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#A72036] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user.displayName?.[0] || user.email?.[0] || "U"}
                  </span>
                </div>
                <span className="text-sm text-gray-700 hidden sm:block">
                  {user.displayName || user.email}
                </span>
              </div>
            )}
            
            {onLogout && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onLogout}
                className="flex items-center space-x-2"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
