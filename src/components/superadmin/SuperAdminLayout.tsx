import { useState, useEffect } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Crown,
  LogOut,
  Building2,
  Users,
  BarChart3,
  Settings,
  Shield,
} from "lucide-react";

const SuperAdminLayout = () => {
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/admin-login");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!profileData || profileData.role !== "super_admin") {
      await supabase.auth.signOut();
      navigate("/admin-login");
      return;
    }

    setProfile(profileData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  const navItems = [
    { path: "/superadmin", icon: BarChart3, label: "Dashboard" },
    { path: "/superadmin/institutions", icon: Building2, label: "Institutions" },
    { path: "/superadmin/users", icon: Users, label: "All Users" },
    { path: "/superadmin/subscriptions", icon: Shield, label: "Subscriptions" },
    { path: "/superadmin/settings", icon: Settings, label: "Settings" },
  ];

  const isActive = (path: string) => {
    if (path === "/superadmin") {
      return location.pathname === "/superadmin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold">Super Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Platform Owner</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{profile?.full_name}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Super Admin</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-4rem)] border-r border-border bg-background/50 backdrop-blur-sm">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={active ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet context={{ profile, checkAuth }} />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
