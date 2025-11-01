import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, mappingResult, conversationHistory } = await req.json();
    
    console.log('Chat request:', { message, headers: mappingResult.headers });

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an AI assistant helping users prepare datasets for LLM fine-tuning. 
The current dataset has the following structure:
- Headers: ${mappingResult.headers.join(', ')}
- Current prompt column: ${mappingResult.mapping.prompt}
- Current completion column: ${mappingResult.mapping.completion}
- Ignored columns: ${mappingResult.mapping.ignored_columns.join(', ')}
- Total rows: ${mappingResult.rowCount}

Help users:
1. Understand their data structure
2. Adjust column mappings if needed
3. Prepare data for fine-tuning
4. Answer questions about the dataset

If the user asks to change mappings, respond with a JSON object in this format:
{
  "response": "your helpful message",
  "updatedMapping": {
    "prompt": "new_prompt_column",
    "completion": "new_completion_column",
    "ignored_columns": ["col1", "col2"]
  }
}

Otherwise, just respond with:
{
  "response": "your helpful message"
}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-5).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log('Calling OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    console.log('AI response:', aiResponse);

    let result;
    try {
      const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanedResponse);
    } catch (e) {
      result = { response: aiResponse };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-mapping function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});