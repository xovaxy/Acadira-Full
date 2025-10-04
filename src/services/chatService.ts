import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ChatSession = Database['public']['Tables']['chat_sessions']['Row'];
type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];

export const chatService = {
  // Create new chat session
  async createSession(studentId: string, institutionId: string, title?: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        student_id: studentId,
        institution_id: institutionId,
        title: title || 'New Chat'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get chat sessions for a student
  async getSessionsByStudent(studentId: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('student_id', studentId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get chat session by ID
  async getSessionById(sessionId: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update chat session title
  async updateSessionTitle(sessionId: string, title: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete chat session
  async deleteSession(sessionId: string) {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
  },

  // Get messages for a chat session
  async getMessages(sessionId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Send a new message
  async sendMessage(message: Omit<ChatMessage, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(message)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Subscribe to new messages in a chat session
  subscribeToMessages(sessionId: string, callback: (message: ChatMessage) => void) {
    return supabase
      .channel(`chat:${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        callback(payload.new as ChatMessage);
      })
      .subscribe();
  }
};