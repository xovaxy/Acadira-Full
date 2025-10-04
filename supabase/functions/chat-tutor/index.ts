  // @ts-ignore: Deno types are available in the edge runtime
  import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };

  const SYSTEM_PROMPT = `You are an expert AI tutor for an educational institution. Your role is to:
  - Provide clear, accurate, and curriculum-aligned answers
  - Explain concepts in a professional yet student-friendly manner
  - Break down complex topics into understandable steps
  - Encourage critical thinking and deeper understanding
  - Always be patient and supportive
  - If asked about topics outside the curriculum, politely redirect to academic subjects

  Respond as a knowledgeable lecturer would, with examples and step-by-step explanations when appropriate.`;

  serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, { 
        status: 200,
        headers: corsHeaders 
      });
    }

    try {
      const { messages } = await req.json();
      
      // Use Google Gemini API (free tier available)
      // @ts-ignore: Deno global is available in edge runtime
      const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

      if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured. Please add it to Supabase Edge Function secrets.");
      }

      // Convert messages to Gemini format
      let conversationHistory = "";
      
      // Add system prompt as the first message
      conversationHistory += `${SYSTEM_PROMPT}\n\n`;
      
      // Add conversation history
      for (const msg of messages) {
        if (msg.role === "user") {
          conversationHistory += `Student: ${msg.content}\n\n`;
        } else if (msg.role === "assistant") {
          conversationHistory += `Tutor: ${msg.content}\n\n`;
        }
      }
      
      const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
      
      console.log("Using Google Gemini API");

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: conversationHistory + (lastUserMessage ? `Student: ${lastUserMessage.content}\n\nTutor:` : ""),
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
              topP: 0.95,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
            {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        if (response.status === 403) {
          return new Response(
            JSON.stringify({ error: "Invalid API key. Please check your GEMINI_API_KEY." }),
            {
              status: 403,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Extract response from Gemini format
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error("Unexpected Gemini response format:", JSON.stringify(data));
        throw new Error("Unexpected response format from Gemini API");
      }

      const assistantMessage = data.candidates[0].content.parts[0].text;

      return new Response(
        JSON.stringify({ response: assistantMessage }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error in chat-tutor function:", error);
      const errorMessage = error instanceof Error ? error.message : "Internal server error";
      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  });
