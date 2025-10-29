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
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing file:', file.name, 'Type:', file.type);

    // Read file content
    const text = await file.text();
    
    // Parse CSV (simple parser for demo)
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Empty file' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const sampleRows = lines.slice(1, Math.min(11, lines.length)).map(line => {
      return line.split(',').map(cell => cell.trim().replace(/^["']|["']$/g, ''));
    });

    console.log('Headers:', headers);
    console.log('Sample rows count:', sampleRows.length);

    // Call OpenAI to analyze columns
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `You are an AI data labeling assistant for LLM fine-tuning datasets.
Given a table's column names and sample rows, identify which columns likely represent:
- "prompt" (input/question for the LLM)
- "completion" (output/answer from the LLM)
- "ignore" (metadata or irrelevant columns)

Column names: ${headers.join(', ')}

Sample rows (first 10):
${sampleRows.map((row, i) => `Row ${i + 1}: ${row.join(' | ')}`).join('\n')}

Return ONLY a JSON object with this exact structure (no markdown, no explanation):
{
  "prompt": "column_name_for_prompt",
  "completion": "column_name_for_completion",
  "ignored_columns": ["col1", "col2"]
}`;

    console.log('Calling OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a data analysis assistant. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
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

    // Parse AI response
    let mapping;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      mapping = JSON.parse(cleanedResponse);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        headers,
        rowCount: lines.length - 1,
        sampleRows: sampleRows.slice(0, 5),
        mapping
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-file function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
