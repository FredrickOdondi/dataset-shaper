import { useState } from "react";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { UploadSection } from "@/components/UploadSection";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // TODO: Process file with AI
    console.log("File selected:", file);
  };

  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <UploadSection onFileSelect={handleFileSelect} />
    </div>
  );
};

export default Index;
