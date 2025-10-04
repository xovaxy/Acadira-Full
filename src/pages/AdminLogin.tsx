import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Loader2 } from "lucide-react";

const AdminLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Check if user is an admin or super_admin
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (profileError) {
          await supabase.auth.signOut();
          throw new Error("Unable to fetch profile. Please try again.");
        }

        if (!profile || !["admin", "super_admin"].includes(profile.role)) {
          await supabase.auth.signOut();
          throw new Error("This account is not registered as an admin");
        }

        toast({
          title: "Welcome back!",
          description: "Successfully logged in",
        });

        // Redirect based on role
        if (profile.role === "super_admin") {
          navigate("/superadmin");
        } else {
          navigate("/admin");
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
          },
        });

        if (error) throw error;

        if (data.user) {
          // Create institution
          const { data: institution, error: institutionError } = await supabase
            .from("institutions")
            .insert({
              name: institutionName,
              email: email,
            })
            .select()
            .single();

          if (institutionError) throw institutionError;

          // Create admin profile
          const { error: profileError } = await supabase.from("profiles").insert({
            user_id: data.user.id,
            email: email,
            full_name: fullName,
            role: "admin",
            institution_id: institution.id,
          });

          if (profileError) throw profileError;

          toast({
            title: "Institution registered!",
            description: "You can now manage your curriculum and students",
          });

          navigate("/admin");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 shadow-card">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="p-2 rounded-lg bg-gradient-primary">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Acadira
          </span>
        </Link>

        <h1 className="text-2xl font-bold text-center mb-2">
          {isLogin ? "Admin Login" : "Register Institution"}
        </h1>
        <p className="text-center text-muted-foreground mb-6">
          {isLogin ? "Access your admin dashboard" : "Create your institution account"}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <Label htmlFor="institutionName">Institution Name</Label>
                <Input
                  id="institutionName"
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  required
                  placeholder="University Name"
                />
              </div>

              <div>
                <Label htmlFor="fullName">Your Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="John Doe"
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@university.edu"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              <>{isLogin ? "Login" : "Register Institution"}</>
            )}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline"
          >
            {isLogin
              ? "New institution? Register here"
              : "Already registered? Login"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:underline">
            Back to home
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
