import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  GraduationCap,
  LogOut,
  Upload,
  Users,
  BarChart3,
  BookOpen,
  Loader2,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Admin = () => {
  const [profile, setProfile] = useState<any>(null);
  const [institution, setInstitution] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [sessionMessages, setSessionMessages] = useState<any[]>([]);
  const [viewChatOpen, setViewChatOpen] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [editStudentOpen, setEditStudentOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentForm, setStudentForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "student" as "student" | "admin" | "super_admin",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

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
    
    // Load curriculum
    const { data: curriculumData } = await supabase
      .from("curriculum")
      .select("*")
      .eq("institution_id", profileData.institution_id)
      .order("created_at", { ascending: false });

    if (curriculumData) setCurriculum(curriculumData);

    // Load analytics
    const { data: analyticsData } = await supabase
      .from("usage_analytics")
      .select("*")
      .eq("institution_id", profileData.institution_id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (analyticsData) setAnalytics(analyticsData);

    // Load all users from the same institution
    const { data: studentsData } = await supabase
      .from("profiles")
      .select("*")
      .eq("institution_id", profileData.institution_id)
      .order("created_at", { ascending: false });

    if (studentsData) setStudents(studentsData);

    // Load student questions (chat messages)
    const { data: questionsData } = await supabase
      .from("chat_messages")
      .select(`
        *,
        chat_sessions!inner(
          student_id,
          profiles!inner(
            full_name,
            email
          )
        )
      `)
      .eq("chat_sessions.institution_id", profileData.institution_id)
      .eq("role", "user")
      .order("created_at", { ascending: false })
      .limit(50);

    if (questionsData) {
      setQuestions(questionsData);
      
      // Generate FAQs by grouping similar questions
      const questionMap = new Map<string, { content: string; count: number; examples: any[] }>();
      
      questionsData.forEach((q) => {
        const normalizedQuestion = q.content.toLowerCase().trim();
        const existing = questionMap.get(normalizedQuestion);
        
        if (existing) {
          existing.count++;
          if (existing.examples.length < 3) {
            existing.examples.push(q);
          }
        } else {
          questionMap.set(normalizedQuestion, {
            content: q.content,
            count: 1,
            examples: [q]
          });
        }
      });
      
      // Convert to array and sort by frequency
      const faqList = Array.from(questionMap.values())
        .filter(faq => faq.count >= 1) // Show all questions
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Top 20 FAQs
      
      setFaqs(faqList);
    }

    // Load all chat sessions for this institution
    const { data: sessionsData, error: sessionsError } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("institution_id", profileData.institution_id)
      .order("updated_at", { ascending: false });

    if (sessionsError) {
      console.error("Error loading chat sessions:", sessionsError);
      toast({
        title: "Warning",
        description: "Failed to load conversations: " + sessionsError.message,
        variant: "destructive",
      });
    }

    // Load student info for each session
    if (sessionsData && sessionsData.length > 0) {
      const studentIds = [...new Set(sessionsData.map(s => s.student_id))];
      const { data: studentsInfo } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", studentIds);

      // Merge student info into sessions
      const sessionsWithProfiles = sessionsData.map(session => ({
        ...session,
        profiles: studentsInfo?.find(s => s.user_id === session.student_id) || null
      }));

      console.log("Loaded chat sessions:", sessionsWithProfiles);
      setChatSessions(sessionsWithProfiles);
    } else {
      setChatSessions([]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Upload to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${profile.institution_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("curriculum")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("curriculum").getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase.from("curriculum").insert({
        institution_id: profile.institution_id,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        uploaded_by: profile.user_id,
      });

      if (dbError) throw dbError;

      toast({
        title: "Success!",
        description: "Curriculum uploaded successfully",
      });

      // Refresh curriculum list
      checkAuth();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  const handleAddStudent = async () => {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", studentForm.email)
        .single();

      if (existingUser) {
        toast({
          title: "Error",
          description: "A user with this email already exists",
          variant: "destructive",
        });
        return;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: studentForm.email,
        password: studentForm.password,
        options: {
          emailRedirectTo: undefined,
          data: {
            full_name: studentForm.full_name,
          }
        }
      });

      if (authError) {
        // Check if error is due to user already existing
        if (authError.message.includes("already registered")) {
          toast({
            title: "Error",
            description: "This email is already registered. If the profile wasn't created, please contact support.",
            variant: "destructive",
          });
        } else {
          throw authError;
        }
        return;
      }

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: authData.user.id,
        email: studentForm.email,
        full_name: studentForm.full_name,
        role: studentForm.role,
        institution_id: profile.institution_id,
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        toast({
          title: "Error",
          description: `Failed to create user profile: ${profileError.message}. The auth account was created but profile failed. Please contact support.`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success!",
        description: `User added successfully as ${studentForm.role}`,
      });

      setAddStudentOpen(false);
      setStudentForm({ email: "", password: "", full_name: "", role: "student" });
      checkAuth();
    } catch (error: any) {
      console.error("Add user error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleEditStudent = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: studentForm.full_name,
          email: studentForm.email,
          role: studentForm.role,
        })
        .eq("id", selectedStudent.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "User updated successfully",
      });

      setEditStudentOpen(false);
      setSelectedStudent(null);
      setStudentForm({ email: "", password: "", full_name: "", role: "student" });
      checkAuth();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", studentId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "User deleted successfully",
      });

      checkAuth();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleViewChat = async (sessionId: string) => {
    try {
      const { data: session } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      let sessionWithProfile = session;
      if (session) {
        // Load student profile separately
        const { data: studentProfile } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .eq("user_id", session.student_id)
          .single();

        sessionWithProfile = { ...session, profiles: studentProfile };
      }

      const { data: messages } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      setSelectedSession(sessionWithProfile);
      setSessionMessages(messages || []);
      setViewChatOpen(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load chat",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-md">
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

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 shadow-card bg-gradient-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Curriculum Files</p>
                <p className="text-2xl font-bold">{curriculum.length}</p>
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
                <p className="text-2xl font-bold">{students.length}</p>
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
                <p className="text-2xl font-bold">{questions.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {faqs.length} unique FAQs
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Curriculum Upload */}
        <Card className="p-6 mb-8 shadow-card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload Curriculum
          </h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="curriculum">Select PDF or Document</Label>
              <Input
                id="curriculum"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </div>

            {uploading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading...</span>
              </div>
            )}
          </div>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="curriculum" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="curriculum">
              <BookOpen className="h-4 w-4 mr-2" />
              Curriculum
            </TabsTrigger>
            <TabsTrigger value="students">
              <Users className="h-4 w-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="conversations">
              <MessageSquare className="h-4 w-4 mr-2" />
              Conversations
            </TabsTrigger>
            <TabsTrigger value="questions">
              <BarChart3 className="h-4 w-4 mr-2" />
              Questions
            </TabsTrigger>
          </TabsList>

          {/* Curriculum Tab */}
          <TabsContent value="curriculum">
            <Card className="p-6 shadow-card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Uploaded Curriculum
              </h2>

              <div className="space-y-3">
                {curriculum.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No curriculum uploaded yet
                  </p>
                ) : (
                  curriculum.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                    >
                      <div>
                        <p className="font-medium">{item.file_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {(item.file_size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card className="p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Manage Users
                </h2>
                <Dialog open={addStudentOpen} onOpenChange={setAddStudentOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                      <DialogDescription>
                        Create a new user account for your institution.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={studentForm.full_name}
                          onChange={(e) =>
                            setStudentForm({ ...studentForm, full_name: e.target.value })
                          }
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={studentForm.email}
                          onChange={(e) =>
                            setStudentForm({ ...studentForm, email: e.target.value })
                          }
                          placeholder="student@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={studentForm.password}
                          onChange={(e) =>
                            setStudentForm({ ...studentForm, password: e.target.value })
                          }
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={studentForm.role}
                          onValueChange={(value: "student" | "admin" | "super_admin") =>
                            setStudentForm({ ...studentForm, role: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleAddStudent} className="w-full">
                        Add User
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.full_name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.role === "super_admin"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                              : student.role === "admin" 
                              ? "bg-primary/10 text-primary" 
                              : "bg-secondary text-secondary-foreground"
                          }`}>
                            {student.role === "super_admin" 
                              ? "Super Admin" 
                              : student.role === "admin" 
                              ? "Admin" 
                              : "Student"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(student.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog
                              open={editStudentOpen && selectedStudent?.id === student.id}
                              onOpenChange={(open) => {
                                setEditStudentOpen(open);
                                if (!open) {
                                  setSelectedStudent(null);
                                  setStudentForm({ email: "", password: "", full_name: "", role: "student" });
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    setStudentForm({
                                      email: student.email,
                                      full_name: student.full_name,
                                      password: "",
                                      role: student.role || "student",
                                    });
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit User</DialogTitle>
                                  <DialogDescription>
                                    Update user information.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="edit-fullName">Full Name</Label>
                                    <Input
                                      id="edit-fullName"
                                      value={studentForm.full_name}
                                      onChange={(e) =>
                                        setStudentForm({
                                          ...studentForm,
                                          full_name: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input
                                      id="edit-email"
                                      type="email"
                                      value={studentForm.email}
                                      onChange={(e) =>
                                        setStudentForm({
                                          ...studentForm,
                                          email: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-role">Role</Label>
                                    <Select
                                      value={studentForm.role}
                                      onValueChange={(value: "student" | "admin" | "super_admin") =>
                                        setStudentForm({ ...studentForm, role: value })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button onClick={handleEditStudent} className="w-full">
                                    Update User
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteStudent(student.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Conversations Tab */}
          <TabsContent value="conversations">
            <Card className="p-6 shadow-card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Student Conversations
              </h2>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Chat Title</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chatSessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No conversations yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    chatSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">
                              {session.profiles?.full_name || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {session.profiles?.email || "No email"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{session.title}</TableCell>
                        <TableCell>
                          {new Date(session.updated_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewChat(session.id)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            View Chat
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions">
            <div className="space-y-6">
              {/* FAQs Section */}
              <Card className="p-6 shadow-card">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Frequently Asked Questions
                </h2>

                <div className="space-y-3">
                  {faqs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No FAQs yet
                    </p>
                  ) : (
                    faqs.map((faq, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">
                                {index + 1}
                              </span>
                              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                Asked {faq.count} {faq.count === 1 ? 'time' : 'times'}
                              </span>
                            </div>
                            <p className="text-sm font-medium">{faq.content}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {faq.examples.slice(0, 3).map((example: any, i: number) => (
                                <span key={i} className="text-xs text-muted-foreground">
                                  {example.chat_sessions?.profiles?.full_name || "Student"}
                                  {i < Math.min(faq.examples.length - 1, 2) && ","}
                                </span>
                              ))}
                              {faq.count > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  and {faq.count - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Recent Questions Section */}
              <Card className="p-6 shadow-card">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Recent Questions
                </h2>

                <div className="space-y-3">
                  {questions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No questions asked yet
                    </p>
                  ) : (
                    questions.slice(0, 10).map((question) => (
                      <div
                        key={question.id}
                        className="p-4 rounded-lg bg-secondary/50 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {question.chat_sessions?.profiles?.full_name || "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {question.chat_sessions?.profiles?.email || "No email"}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(question.created_at).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm pl-10">{question.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* View Chat Dialog */}
        <Dialog open={viewChatOpen} onOpenChange={setViewChatOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Chat with {selectedSession?.profiles?.full_name || "Student"}
              </DialogTitle>
              <DialogDescription>
                {selectedSession?.title} - Started on{" "}
                {selectedSession?.created_at &&
                  new Date(selectedSession.created_at).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {sessionMessages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No messages in this conversation
                </p>
              ) : (
                sessionMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0">
                        <div className="p-2 rounded-full bg-primary/10">
                          <GraduationCap className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <div className="flex-shrink-0">
                        <div className="p-2 rounded-full bg-accent/10">
                          <User className="h-4 w-4 text-accent" />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;
