import { useState } from "react";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { UploadSection } from "@/components/UploadSection";
import { MappingSection } from "@/components/MappingSection";
import { ChatSection } from "@/components/ChatSection";
import { toast } from "sonner";

interface MappingResult {
  headers: string[];
  rowCount: number;
  sampleRows: string[][];
  mapping: {
    prompt: string;
    completion: string;
    ignored_columns: string[];
  };
}

interface DatabaseConnection {
  type: 'postgresql' | 'supabase';
  host?: string;
  port?: string;
  database?: string;
  username?: string;
  password?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
}

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mappingResult, setMappingResult] = useState<MappingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dbConnection, setDbConnection] = useState<DatabaseConnection | null>(null);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);

  const addProcessingStep = (step: string) => {
    setProcessingSteps(prev => [...prev, step]);
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    setProcessingSteps([]);
    
    try {
      addProcessingStep(`📁 File selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      addProcessingStep("🔄 Uploading file to AI processor...");
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-file`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        let errorMessage = 'Failed to process file';
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      addProcessingStep("🤖 AI analyzing column structure...");
      const result = await response.json();
      
      addProcessingStep(`✅ Found ${result.headers.length} columns`);
      addProcessingStep(`📊 Analyzed ${result.rowCount} rows`);
      addProcessingStep(`💡 Identified prompt column: "${result.mapping.prompt}"`);
      addProcessingStep(`💡 Identified completion column: "${result.mapping.completion}"`);
      
      setMappingResult(result);
      toast.success("AI analysis complete! Review the suggested mappings below.");
    } catch (error) {
      console.error('Error processing file:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to process file';
      addProcessingStep(`❌ Error: ${errorMsg}`);
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDatabaseConnect = async (connection: DatabaseConnection) => {
    setDbConnection(connection);
    setIsProcessing(true);
    setProcessingSteps([]);
    
    try {
      addProcessingStep(`🔌 Connecting to ${connection.type === 'postgresql' ? 'PostgreSQL' : 'Supabase'} database...`);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-database`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
          },
          body: JSON.stringify(connection),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to connect to database');
      }

      addProcessingStep("✅ Database connection established");
      addProcessingStep("🔍 Fetching table schemas...");
      
      const result = await response.json();
      
      addProcessingStep(`📊 Found ${result.headers.length} columns`);
      addProcessingStep(`🤖 AI analyzing data structure...`);
      
      setMappingResult(result);
      toast.success("Database connected! AI analysis complete.");
    } catch (error) {
      console.error('Error connecting to database:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to connect to database';
      addProcessingStep(`❌ Error: ${errorMsg}`);
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <UploadSection 
        onFileSelect={handleFileSelect} 
        onDatabaseConnect={handleDatabaseConnect}
        isProcessing={isProcessing} 
      />
      
      {processingSteps.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 shadow-elegant">
              <h3 className="text-lg font-semibold mb-4">Processing Steps</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {processingSteps.map((step, index) => (
                  <div key={index} className="text-sm text-muted-foreground animate-in fade-in slide-in-from-left-2">
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      
      {mappingResult && selectedFile && (
        <MappingSection 
          fileName={selectedFile.name}
          mappingResult={mappingResult}
          file={selectedFile}
        />
      )}
      
      {mappingResult && (
        <ChatSection 
          mappingResult={mappingResult}
          onMappingUpdate={setMappingResult}
        />
      )}
    </div>
  );
};

export default Index;
