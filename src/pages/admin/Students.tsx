import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Students = () => {
  const { profile, checkAuth } = useOutletContext<any>();
  const [students, setStudents] = useState<any[]>([]);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [editStudentOpen, setEditStudentOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentForm, setStudentForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "student" as "student" | "admin" | "super_admin",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      loadStudents();
    }
  }, [profile]);

  const loadStudents = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("institution_id", profile.institution_id)
      .order("created_at", { ascending: false });

    if (data) setStudents(data);
  };

  const handleAddStudent = async () => {
    try {
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
        if (authError.message.includes("already registered")) {
          toast({
            title: "Error",
            description: "This email is already registered.",
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

      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: authData.user.id,
        email: studentForm.email,
        full_name: studentForm.full_name,
        role: studentForm.role,
        institution_id: profile.institution_id,
      });

      if (profileError) {
        toast({
          title: "Error",
          description: `Failed to create user profile: ${profileError.message}`,
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
      loadStudents();
    } catch (error: any) {
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
      loadStudents();
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

      loadStudents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Students Management</h1>
          <p className="text-muted-foreground">Manage student and admin accounts</p>
        </div>
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

      <Card className="p-6 shadow-card">
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
    </div>
  );
};

export default Students;
