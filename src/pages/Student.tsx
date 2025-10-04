import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { chatService } from "@/services/chatService";
import { filterOffensiveContent } from "@/lib/contentFilter";
import { Send, LogOut, Loader2, GraduationCap, User, Plus, MessageSquare, AlertTriangle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Student = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/student-login");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!profileData || profileData.role !== "student") {
      await supabase.auth.signOut();
      navigate("/student-login");
      return;
    }

    setProfile(profileData);

    // Load chat sessions
    await loadChatSessions(profileData.user_id);
  };

  const loadChatSessions = async (userId: string) => {
    try {
      const sessions = await chatService.getSessionsByStudent(userId);
      setChatSessions(sessions);
    } catch (error: any) {
      console.error("Failed to load chat sessions:", error);
    }
  };

  const handleNewChat = async () => {
    if (!profile) return;

    try {
      const session = await chatService.createSession(
        profile.user_id,
        profile.institution_id,
        "New Chat"
      );
      setCurrentSession(session);
      setMessages([]);
      await loadChatSessions(profile.user_id);
      setSheetOpen(false);
      toast({
        title: "New Chat Started",
        description: "You can now start asking questions!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create chat session",
        variant: "destructive",
      });
    }
  };

  const handleLoadSession = async (sessionId: string) => {
    try {
      const session = await chatService.getSessionById(sessionId);
      const sessionMessages = await chatService.getMessages(sessionId);
      
      setCurrentSession(session);
      setMessages(sessionMessages.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      })));
      setSheetOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load chat session",
        variant: "destructive",
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    // Check for offensive content
    const filterResult = filterOffensiveContent(input);
    if (!filterResult.isClean) {
      toast({
        title: "Inappropriate Content Detected",
        description: `Your message contains inappropriate language. Please keep the conversation respectful and educational.`,
        variant: "destructive",
      });
      return;
    }

    // Create a session if none exists
    let session = currentSession;
    if (!session && profile) {
      try {
        session = await chatService.createSession(
          profile.user_id,
          profile.institution_id,
          input.slice(0, 50) // Use first 50 chars as title
        );
        setCurrentSession(session);
        await loadChatSessions(profile.user_id);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to create chat session",
          variant: "destructive",
        });
        return;
      }
    }

    if (!session) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Save user message to database
      await chatService.sendMessage({
        session_id: session.id,
        role: "user",
        content: userMessage.content,
      });

      // Get AI response
      const { data, error } = await supabase.functions.invoke("chat-tutor", {
        body: {
          messages: [...messages, userMessage],
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
      };

      // Save assistant message to database
      await chatService.sendMessage({
        session_id: session.id,
        role: "assistant",
        content: assistantMessage.content,
      });

      setMessages((prev) => [...prev, assistantMessage]);

      // Create analytics entry
      await supabase.from("usage_analytics").insert({
        institution_id: profile.institution_id,
        student_id: profile.user_id,
        session_id: session.id,
        question_count: 1,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/student-login");
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
              <h1 className="font-bold">Acadira AI Tutor</h1>
              <p className="text-xs text-muted-foreground">
                Your 24/7 learning companion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chats
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Chat History</SheetTitle>
                  <SheetDescription>
                    View and manage your chat sessions
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  <Button onClick={handleNewChat} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    New Chat
                  </Button>
                  <div className="space-y-2 mt-4">
                    {chatSessions.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No chat history yet
                      </p>
                    ) : (
                      chatSessions.map((session) => (
                        <Button
                          key={session.id}
                          variant={currentSession?.id === session.id ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => handleLoadSession(session.id)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          <span className="truncate">{session.title}</span>
                        </Button>
                      ))
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
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

      {/* Chat Interface */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="h-[calc(100vh-200px)] flex flex-col shadow-card">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                  <GraduationCap className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  Welcome to your AI Tutor!
                </h2>
                <p className="text-muted-foreground">
                  Ask any question about your curriculum and I'll help you understand it better.
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 bg-gradient-primary">
                    <GraduationCap className="h-5 w-5 text-primary-foreground" />
                  </Avatar>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8 bg-accent">
                    <User className="h-5 w-5 text-accent-foreground" />
                  </Avatar>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 bg-gradient-primary">
                  <GraduationCap className="h-5 w-5 text-primary-foreground" />
                </Avatar>
                <div className="bg-secondary text-secondary-foreground rounded-2xl px-4 py-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything about your curriculum..."
                disabled={loading}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Student;
