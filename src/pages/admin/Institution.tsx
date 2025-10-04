import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Building2,
  CreditCard,
  Activity,
  Calendar,
  Edit,
  Check,
  X,
  Database,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const Institution = () => {
  const { profile, institution, checkAuth } = useOutletContext<any>();
  const [editing, setEditing] = useState(false);
  const [institutionForm, setInstitutionForm] = useState({
    name: "",
    address: "",
    contact_email: "",
    contact_phone: "",
  });
  const [usage, setUsage] = useState({
    totalQuestions: 0,
    totalStudents: 0,
    totalConversations: 0,
    monthlyQuestions: 0,
  });
  const [subscription, setSubscription] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (institution) {
      setInstitutionForm({
        name: institution.name || "",
        address: institution.address || "",
        contact_email: institution.contact_email || "",
        contact_phone: institution.contact_phone || "",
      });
    }
    if (profile) {
      loadUsageStats();
      loadSubscription();
    }
  }, [institution, profile]);

  const loadUsageStats = async () => {
    // Load total questions
    const { count: questionsCount } = await supabase
      .from("chat_messages")
      .select("*, chat_sessions!inner(*)", { count: "exact", head: true })
      .eq("chat_sessions.institution_id", profile.institution_id)
      .eq("role", "user");

    // Load total students
    const { count: studentsCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("institution_id", profile.institution_id)
      .eq("role", "student");

    // Load total conversations
    const { count: conversationsCount } = await supabase
      .from("chat_sessions")
      .select("*", { count: "exact", head: true })
      .eq("institution_id", profile.institution_id);

    // Load this month's questions
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const { count: monthlyQuestionsCount } = await supabase
      .from("chat_messages")
      .select("*, chat_sessions!inner(*)", { count: "exact", head: true })
      .eq("chat_sessions.institution_id", profile.institution_id)
      .eq("role", "user")
      .gte("created_at", firstDayOfMonth.toISOString());

    setUsage({
      totalQuestions: questionsCount || 0,
      totalStudents: studentsCount || 0,
      totalConversations: conversationsCount || 0,
      monthlyQuestions: monthlyQuestionsCount || 0,
    });
  };

  const loadSubscription = async () => {
    // @ts-ignore - subscriptions table not in generated types yet
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("institution_id", profile.institution_id)
      .single();

    if (error) {
      console.error("Error loading subscription:", error);
      return;
    }

    if (data) {
      setSubscription(data);
    }
  };

  const handleUpdateInstitution = async () => {
    try {
      const { error } = await supabase
        .from("institutions")
        .update(institutionForm)
        .eq("id", institution.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Institution details updated successfully",
      });

      setEditing(false);
      checkAuth();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const usagePercentage = subscription 
    ? (subscription.current_usage / subscription.monthly_question_limit) * 100 
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Institution Management</h1>
        <p className="text-muted-foreground">Manage your institution settings and subscription</p>
      </div>

      {/* Subscription Card */}
      <Card className="p-6 shadow-card bg-gradient-card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Subscription</h2>
              <p className="text-sm text-muted-foreground">
                {subscription?.plan?.charAt(0).toUpperCase() + subscription?.plan?.slice(1) || "Loading..."} Plan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              subscription?.status === "active" 
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : subscription?.status === "suspended"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            }`}>
              {subscription?.status?.charAt(0).toUpperCase() + subscription?.status?.slice(1) || "Loading"}
            </div>
          </div>
        </div>

        {subscription ? (
          <>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Renewal Date</span>
                </div>
                <p className="text-2xl font-bold">
                  {new Date(subscription.end_date).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {Math.ceil((new Date(subscription.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Monthly Usage</span>
                </div>
                <p className="text-2xl font-bold">
                  {subscription.current_usage.toLocaleString()} / {subscription.monthly_question_limit.toLocaleString()}
                </p>
                <Progress value={usagePercentage} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-1">
                  {usagePercentage.toFixed(1)}% used
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Storage</span>
                </div>
                <p className="text-2xl font-bold">
                  {/* @ts-ignore */}
                  {subscription.storage_used_gb?.toFixed(2) || "0.00"} / {subscription.storage_limit_gb?.toFixed(0) || "10"} GB
                </p>
                <Progress 
                  value={((subscription.storage_used_gb || 0) / (subscription.storage_limit_gb || 10)) * 100} 
                  className="mt-2" 
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {/* @ts-ignore */}
                  {(((subscription.storage_used_gb || 0) / (subscription.storage_limit_gb || 10)) * 100).toFixed(1)}% used
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            Loading subscription details...
          </div>
        )}

        <div className="mt-6">
          <Button className="w-full md:w-auto">
            <CreditCard className="h-4 w-4 mr-2" />
            Renew Subscription
          </Button>
        </div>
      </Card>

      {/* Usage Statistics */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total Questions</span>
          </div>
          <p className="text-3xl font-bold">{usage.totalQuestions.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">All time</p>
        </Card>

        <Card className="p-6 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-accent/10">
              <Building2 className="h-5 w-5 text-accent" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total Students</span>
          </div>
          <p className="text-3xl font-bold">{usage.totalStudents.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">Active users</p>
        </Card>

        <Card className="p-6 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Conversations</span>
          </div>
          <p className="text-3xl font-bold">{usage.totalConversations.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">Total chats</p>
        </Card>
      </div>

      {/* Institution Details */}
      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Institution Details</h2>
              <p className="text-sm text-muted-foreground">Manage your institution information</p>
            </div>
          </div>
          {!editing && (
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="inst-name">Institution Name</Label>
              <Input
                id="inst-name"
                value={institutionForm.name}
                onChange={(e) =>
                  setInstitutionForm({ ...institutionForm, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="inst-address">Address</Label>
              <Textarea
                id="inst-address"
                value={institutionForm.address}
                onChange={(e) =>
                  setInstitutionForm({ ...institutionForm, address: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inst-email">Contact Email</Label>
                <Input
                  id="inst-email"
                  type="email"
                  value={institutionForm.contact_email}
                  onChange={(e) =>
                    setInstitutionForm({ ...institutionForm, contact_email: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="inst-phone">Contact Phone</Label>
                <Input
                  id="inst-phone"
                  type="tel"
                  value={institutionForm.contact_phone}
                  onChange={(e) =>
                    setInstitutionForm({ ...institutionForm, contact_phone: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUpdateInstitution}>
                <Check className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setInstitutionForm({
                    name: institution.name || "",
                    address: institution.address || "",
                    contact_email: institution.contact_email || "",
                    contact_phone: institution.contact_phone || "",
                  });
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Institution Name</p>
              <p className="text-lg font-medium">{institution?.name || "Not set"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="text-lg font-medium">{institution?.address || "Not set"}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Contact Email</p>
                <p className="text-lg font-medium">{institution?.contact_email || "Not set"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Contact Phone</p>
                <p className="text-lg font-medium">{institution?.contact_phone || "Not set"}</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Institution;
