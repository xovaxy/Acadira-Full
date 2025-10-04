import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Users, BarChart3 } from "lucide-react";

const Dashboard = () => {
  const { profile, institution } = useOutletContext<any>();
  const [stats, setStats] = useState({
    curriculum: 0,
    students: 0,
    questions: 0,
    faqs: 0,
  });

  useEffect(() => {
    if (profile) {
      loadStats();
    }
  }, [profile]);

  const loadStats = async () => {
    // Load curriculum count
    const { count: curriculumCount } = await supabase
      .from("curriculum")
      .select("*", { count: "exact", head: true })
      .eq("institution_id", profile.institution_id);

    // Load students count
    const { count: studentsCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("institution_id", profile.institution_id);

    // Load questions count
    const { count: questionsCount } = await supabase
      .from("chat_messages")
      .select("*, chat_sessions!inner(*)", { count: "exact", head: true })
      .eq("chat_sessions.institution_id", profile.institution_id)
      .eq("role", "user");

    setStats({
      curriculum: curriculumCount || 0,
      students: studentsCount || 0,
      questions: questionsCount || 0,
      faqs: 0,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {profile?.full_name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 shadow-card bg-gradient-card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Curriculum Files</p>
              <p className="text-2xl font-bold">{stats.curriculum}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card bg-gradient-card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{stats.students}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card bg-gradient-card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Questions</p>
              <p className="text-2xl font-bold">{stats.questions}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 shadow-card">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <a href="/admin/curriculum" className="p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Upload Curriculum</p>
                <p className="text-sm text-muted-foreground">Add new course materials</p>
              </div>
            </div>
          </a>
          
          <a href="/admin/students" className="p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium">Manage Students</p>
                <p className="text-sm text-muted-foreground">Add or edit student accounts</p>
              </div>
            </div>
          </a>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
