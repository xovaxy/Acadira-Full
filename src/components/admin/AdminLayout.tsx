import { useState, useEffect } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  GraduationCap,
  LogOut,
  Upload,
  Users,
  BarChart3,
  BookOpen,
  MessageSquare,
  LayoutDashboard,
  Building2,
  AlertTriangle,
} from "lucide-react";

const AdminLayout = () => {
  const [profile, setProfile] = useState<any>(null);
  const [institution, setInstitution] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
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
      .select("*, institutions(*)")
      .eq("user_id", user.id)
      .single();

    if (!profileData || !["admin", "super_admin"].includes(profileData.role)) {
      await supabase.auth.signOut();
      navigate("/admin-login");
      return;
    }

    setProfile(profileData);
    setInstitution(profileData.institutions);

    // Check subscription status and auto-expire if needed
    // @ts-ignore - subscriptions table not in generated types yet
    const { data: subscriptionData } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("institution_id", profileData.institution_id)
      .single();

    if (subscriptionData) {
      // @ts-ignore - Type checking disabled for subscription fields
      const endDate = new Date(subscriptionData.end_date);
      const now = new Date();
      
      // @ts-ignore - Type checking disabled for subscription fields
      if (endDate < now && subscriptionData.status === 'active') {
        // Auto-expire the subscription
        // @ts-ignore - subscriptions table not in generated types yet
        const { data: updatedSub } = await supabase
          .from("subscriptions")
          .update({ status: 'expired' })
          .eq("id", subscriptionData.id)
          .select()
          .single();
        
        setSubscription(updatedSub || subscriptionData);
      } else {
        setSubscription(subscriptionData);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  const navItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/curriculum", icon: BookOpen, label: "Curriculum" },
    { path: "/admin/students", icon: Users, label: "Students" },
    { path: "/admin/conversations", icon: MessageSquare, label: "Conversations" },
    { path: "/admin/questions", icon: BarChart3, label: "Questions" },
    { path: "/admin/institution", icon: Building2, label: "Institution" },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold">{institution?.name}</h1>
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{profile?.full_name}</p>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Subscription Suspended Warning */}
      {/* @ts-ignore - subscription type */}
      {subscription?.status === "suspended" && (
        <div className="bg-destructive text-destructive-foreground">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Your subscription has been suspended</p>
                <p className="text-sm mt-1">
                  {/* @ts-ignore - subscription type */}
                  <strong>Reason:</strong> {subscription.suspension_reason || "No reason provided"}
                </p>
                <p className="text-sm mt-1">
                  Please contact support or the platform administrator to resolve this issue.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Expired Warning */}
      {/* @ts-ignore - subscription type */}
      {subscription?.status === "expired" && (
        <div className="bg-amber-600 text-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Your subscription has expired</p>
                <p className="text-sm mt-1">
                  {/* @ts-ignore - subscription type */}
                  Your subscription ended on {new Date(subscription.end_date).toLocaleDateString()}
                </p>
                <p className="text-sm mt-1">
                  Please contact the platform administrator to renew your subscription.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    // @ts-ignore - subscription type
                    disabled={subscription?.status === "suspended" || subscription?.status === "expired"}
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
          {/* @ts-ignore - subscription type */}
          {subscription?.status === "suspended" ? (
            <Card className="p-8 text-center">
              <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Subscription Suspended</h2>
              <p className="text-muted-foreground mb-4">
                Your institution's subscription has been suspended and you cannot access the platform features.
              </p>
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 max-w-2xl mx-auto">
                <p className="font-semibold text-destructive mb-2">Suspension Reason:</p>
                {/* @ts-ignore - subscription type */}
                <p className="text-sm">{subscription.suspension_reason || "No reason provided"}</p>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                Please contact the platform administrator to resolve this issue.
              </p>
            </Card>
          ) : (
            // @ts-ignore - subscription type
            subscription?.status === "expired" ? (
            <Card className="p-8 text-center">
              <AlertTriangle className="h-16 w-16 text-amber-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Subscription Expired</h2>
              <p className="text-muted-foreground mb-4">
                Your institution's subscription has expired and you cannot access the platform features.
              </p>
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 max-w-2xl mx-auto">
                <p className="font-semibold text-amber-900 dark:text-amber-200 mb-2">Subscription End Date:</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {/* @ts-ignore - subscription type */}
                  {new Date(subscription.end_date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                Please contact the platform administrator to renew your subscription and regain access.
              </p>
            </Card>
          ) : (
            <Outlet context={{ profile, institution, subscription, checkAuth }} />
          )
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
