import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: {
    id: string
    file_url: string
    institution_id: string
  }
  schema: string
  old_record: null | Record<string, any>
}

serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json()
    
    // Only process new curriculum uploads
    if (payload.type !== 'INSERT' || payload.table !== 'curriculum') {
      return new Response(JSON.stringify({ message: 'Not a curriculum insert' }), { 
        status: 200 
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Process the curriculum file
    // Here you can add AI processing, content extraction, etc.
    const processingResult = {
      processed: true,
      timestamp: new Date().toISOString()
    }

    // Update the curriculum record with processing results
    const { error } = await supabase
      .from('curriculum')
      .update(processingResult)
      .eq('id', payload.record.id)

    if (error) throw error

    return new Response(JSON.stringify({ 
      message: 'Curriculum processed successfully' 
    }), { 
      status: 200 
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500 
    })
  }
})