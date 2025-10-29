import { useState } from "react";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { UploadSection } from "@/components/UploadSection";
import { MappingSection } from "@/components/MappingSection";
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

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mappingResult, setMappingResult] = useState<MappingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-file`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process file');
      }

      const result = await response.json();
      setMappingResult(result);
      toast.success("AI analysis complete! Review the suggested mappings below.");
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <UploadSection onFileSelect={handleFileSelect} isProcessing={isProcessing} />
      {mappingResult && (
        <MappingSection 
          fileName={selectedFile?.name || 'file'}
          mappingResult={mappingResult}
        />
      )}
    </div>
  );
};

export default Index;
