import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const connection = await req.json();
    
    console.log('Database connection request:', connection.type);

    let headers: string[] = [];
    let sampleRows: string[][] = [];
    let rowCount = 0;

    if (connection.type === 'supabase') {
      // Connect to Supabase
      const supabase = createClient(
        connection.supabaseUrl,
        connection.supabaseKey
      );

      // Get first table (you can modify this to let user select table)
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(1);

      if (tablesError) throw new Error(`Failed to fetch tables: ${tablesError.message}`);
      if (!tables || tables.length === 0) throw new Error('No tables found in database');

      const tableName = tables[0].table_name;
      console.log('Using table:', tableName);

      // Get table data
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(20);

      if (error) throw new Error(`Failed to fetch data: ${error.message}`);
      if (!data || data.length === 0) throw new Error('Table is empty');

      headers = Object.keys(data[0]);
      sampleRows = data.map(row => headers.map(h => String(row[h] || '')));
      rowCount = count || data.length;

    } else if (connection.type === 'postgresql') {
      // For PostgreSQL, we'd need a Postgres client library
      // This is a placeholder - full implementation would require pg library
      throw new Error('PostgreSQL direct connection not yet implemented. Please use Supabase connection.');
    }

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
${sampleRows.slice(0, 10).map((row, i) => `Row ${i + 1}: ${row.join(' | ')}`).join('\n')}

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

    let mapping;
    try {
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
        rowCount,
        sampleRows: sampleRows.slice(0, 20),
        mapping
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-database function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});