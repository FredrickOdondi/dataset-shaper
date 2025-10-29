import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, AlertCircle, Database, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface UploadSectionProps {
  onFileSelect: (file: File) => void;
  onDatabaseConnect: (connection: DatabaseConnection) => void;
  isProcessing?: boolean;
}
