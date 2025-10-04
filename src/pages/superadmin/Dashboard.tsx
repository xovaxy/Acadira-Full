import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, Activity, CreditCard } from "lucide-react";

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalInstitutions: 0,
    totalUsers: 0,
    totalQuestions: 0,
    activeSubscriptions: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    // Load institutions count
    const { count: institutionsCount } = await supabase
      .from("institutions")
      .select("*", { count: "exact", head: true });

    // Load users count
    const { count: usersCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Load total questions count
    const { count: questionsCount } = await supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("role", "user");

    setStats({
      totalInstitutions: institutionsCount || 0,
      totalUsers: usersCount || 0,
      totalQuestions: questionsCount || 0,
      activeSubscriptions: institutionsCount || 0, // Mock - all institutions considered active
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6 shadow-card bg-gradient-card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
              <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Institutions</p>
              <p className="text-2xl font-bold">{stats.totalInstitutions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card bg-gradient-card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card bg-gradient-card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Questions</p>
              <p className="text-2xl font-bold">{stats.totalQuestions.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card bg-gradient-card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900">
              <CreditCard className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Subscriptions</p>
              <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Links */}
      <Card className="p-6 shadow-card">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <a href="/superadmin/institutions" className="p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium">Manage Institutions</p>
                <p className="text-sm text-muted-foreground">Add or manage institutions</p>
              </div>
            </div>
          </a>
          
          <a href="/superadmin/subscriptions" className="p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-medium">Manage Subscriptions</p>
                <p className="text-sm text-muted-foreground">View and manage subscriptions</p>
              </div>
            </div>
          </a>
        </div>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
