import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, GraduationCap, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Conversations = () => {
  const { profile } = useOutletContext<any>();
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [sessionMessages, setSessionMessages] = useState<any[]>([]);
  const [viewChatOpen, setViewChatOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      loadSessions();
    }
  }, [profile]);

  const loadSessions = async () => {
    const { data: sessionsData, error: sessionsError } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("institution_id", profile.institution_id)
      .order("updated_at", { ascending: false });

    if (sessionsError) {
      console.error("Error loading chat sessions:", sessionsError);
      toast({
        title: "Warning",
        description: "Failed to load conversations: " + sessionsError.message,
        variant: "destructive",
      });
    }

    if (sessionsData && sessionsData.length > 0) {
      const studentIds = [...new Set(sessionsData.map(s => s.student_id))];
      const { data: studentsInfo } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", studentIds);

      const sessionsWithProfiles = sessionsData.map(session => ({
        ...session,
        profiles: studentsInfo?.find(s => s.user_id === session.student_id) || null
      }));

      setChatSessions(sessionsWithProfiles);
    } else {
      setChatSessions([]);
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Conversations</h1>
        <p className="text-muted-foreground">View all student conversations with AI tutor</p>
      </div>

      <Card className="p-6 shadow-card">
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
  );
};

export default Conversations;
