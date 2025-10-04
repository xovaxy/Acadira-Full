import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, MessageSquare, Users } from "lucide-react";

const Questions = () => {
  const { profile } = useOutletContext<any>();
  const [questions, setQuestions] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    if (profile) {
      loadQuestions();
    }
  }, [profile]);

  const loadQuestions = async () => {
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
      .eq("chat_sessions.institution_id", profile.institution_id)
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
        .filter(faq => faq.count >= 1)
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
      
      setFaqs(faqList);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Questions & FAQs</h1>
        <p className="text-muted-foreground">View frequently asked questions and recent queries</p>
      </div>

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
  );
};

export default Questions;
