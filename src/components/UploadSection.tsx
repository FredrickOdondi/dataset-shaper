import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface UploadSectionProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
}

export const UploadSection = ({ onFileSelect, isProcessing = false }: UploadSectionProps) => {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      
      // Validate file type
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!validTypes.includes(selectedFile.type) && 
          !selectedFile.name.endsWith('.csv') && 
          !selectedFile.name.endsWith('.xlsx') &&
          !selectedFile.name.endsWith('.xls')) {
        toast.error("Invalid file type. Please upload CSV or Excel files only.");
        return;
      }
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 10MB.");
        return;
      }
      
      setFile(selectedFile);
      toast.success(`File "${selectedFile.name}" selected successfully!`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  });

  const handleProcess = () => {
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <section className="py-24 px-4 bg-gradient-subtle">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Upload Your Data</h2>
          <p className="text-xl text-muted-foreground">
            CSV or Excel files accepted • Max 10MB
          </p>
        </div>

        <Card className="p-8 border-border bg-card/50 backdrop-blur-sm shadow-elegant">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? "border-primary bg-primary/5 shadow-glow"
                : "border-border hover:border-primary/50 hover:bg-primary/5"
            }`}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center gap-4">
              {file ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft">
                    <FileSpreadsheet className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground mb-1">
                      {file.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground mb-1">
                      {isDragActive ? "Drop it here!" : "Drag & drop your file here"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {file && (
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Ready to process</p>
                  <p>AI will analyze your data and suggest column mappings for fine-tuning.</p>
                </div>
              </div>
              
              <Button
                onClick={handleProcess}
                disabled={isProcessing}
                className="w-full bg-gradient-primary shadow-elegant hover:shadow-glow transition-all duration-300"
                size="lg"
              >
                {isProcessing ? "Processing..." : "Process with AI"}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};
