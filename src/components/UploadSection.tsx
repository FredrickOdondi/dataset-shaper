import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, AlertCircle, Database, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface DatabaseConnection {
  type: 'postgresql' | 'supabase';
  host?: string;
  port?: string;
  database?: string;
  username?: string;
  password?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
  tableName?: string;
}

interface UploadSectionProps {
  onFileSelect: (file: File) => void;
  onDatabaseConnect: (connection: DatabaseConnection) => void;
  isProcessing?: boolean;
}

export const UploadSection = ({ onFileSelect, onDatabaseConnect, isProcessing = false }: UploadSectionProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<string>("file");
  
  // PostgreSQL connection state
  const [pgConnection, setPgConnection] = useState({
    host: '',
    port: '5432',
    database: '',
    username: '',
    password: ''
  });
  
  // Supabase connection state
  const [supabaseConnection, setSupabaseConnection] = useState({
    supabaseUrl: '',
    supabaseKey: '',
    tableName: ''
  });

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
  
  const handlePostgresConnect = () => {
    // Validate PostgreSQL connection
    if (!pgConnection.host || !pgConnection.database || !pgConnection.username || !pgConnection.password) {
      toast.error("Please fill in all required PostgreSQL fields");
      return;
    }
    
    onDatabaseConnect({
      type: 'postgresql',
      ...pgConnection
    });
    toast.success("Connecting to PostgreSQL database...");
  };
  
  const handleSupabaseConnect = () => {
    // Validate Supabase connection
    if (!supabaseConnection.supabaseUrl || !supabaseConnection.supabaseKey || !supabaseConnection.tableName) {
      toast.error("Please provide Supabase URL, API Key, and Table Name");
      return;
    }
    
    onDatabaseConnect({
      type: 'supabase',
      ...supabaseConnection
    });
    toast.success("Connecting to Supabase...");
  };

  return (
    <section className="py-24 px-4 bg-gradient-subtle">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Connect Your Data Source</h2>
          <p className="text-xl text-muted-foreground">
            Upload files or connect directly to your database
          </p>
        </div>

        <Card className="p-8 border-border bg-card/50 backdrop-blur-sm shadow-elegant">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="file" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                File Upload
              </TabsTrigger>
              <TabsTrigger value="postgresql" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                PostgreSQL
              </TabsTrigger>
              <TabsTrigger value="supabase" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Supabase
              </TabsTrigger>
            </TabsList>

            {/* File Upload Tab */}
            <TabsContent value="file" className="space-y-6">
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
                          or click to browse • CSV or Excel • Max 10MB
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {file && (
                <div className="flex flex-col gap-4">
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
            </TabsContent>

            {/* PostgreSQL Tab */}
            <TabsContent value="postgresql" className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pg-host">Host *</Label>
                    <Input
                      id="pg-host"
                      placeholder="localhost or IP address"
                      value={pgConnection.host}
                      onChange={(e) => setPgConnection({ ...pgConnection, host: e.target.value })}
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pg-port">Port</Label>
                    <Input
                      id="pg-port"
                      placeholder="5432"
                      value={pgConnection.port}
                      onChange={(e) => setPgConnection({ ...pgConnection, port: e.target.value })}
                      disabled={isProcessing}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pg-database">Database Name *</Label>
                  <Input
                    id="pg-database"
                    placeholder="my_database"
                    value={pgConnection.database}
                    onChange={(e) => setPgConnection({ ...pgConnection, database: e.target.value })}
                    disabled={isProcessing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pg-username">Username *</Label>
                  <Input
                    id="pg-username"
                    placeholder="postgres"
                    value={pgConnection.username}
                    onChange={(e) => setPgConnection({ ...pgConnection, username: e.target.value })}
                    disabled={isProcessing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pg-password">Password *</Label>
                  <Input
                    id="pg-password"
                    type="password"
                    placeholder="••••••••"
                    value={pgConnection.password}
                    onChange={(e) => setPgConnection({ ...pgConnection, password: e.target.value })}
                    disabled={isProcessing}
                  />
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Secure Connection</p>
                  <p>Your credentials are used only to establish a connection and are not stored.</p>
                </div>
              </div>
              
              <Button
                onClick={handlePostgresConnect}
                disabled={isProcessing}
                className="w-full bg-gradient-primary shadow-elegant hover:shadow-glow transition-all duration-300"
                size="lg"
              >
                {isProcessing ? "Connecting..." : "Connect to PostgreSQL"}
              </Button>
            </TabsContent>

            {/* Supabase Tab */}
            <TabsContent value="supabase" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="supabase-url">Supabase Project URL *</Label>
                  <Input
                    id="supabase-url"
                    placeholder="https://xxxxx.supabase.co"
                    value={supabaseConnection.supabaseUrl}
                    onChange={(e) => setSupabaseConnection({ ...supabaseConnection, supabaseUrl: e.target.value })}
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-muted-foreground">
                    Find this in your Supabase project settings
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supabase-key">Supabase Anon/Service Key *</Label>
                  <Input
                    id="supabase-key"
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseConnection.supabaseKey}
                    onChange={(e) => setSupabaseConnection({ ...supabaseConnection, supabaseKey: e.target.value })}
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use anon key for public access or service key for admin access
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supabase-table">Table Name *</Label>
                  <Input
                    id="supabase-table"
                    placeholder="my_table"
                    value={supabaseConnection.tableName}
                    onChange={(e) => setSupabaseConnection({ ...supabaseConnection, tableName: e.target.value })}
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-muted-foreground">
                    The name of the table containing your fine-tuning data
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Secure Connection</p>
                  <p>Your API keys are used only to establish a connection and are not stored.</p>
                </div>
              </div>
              
              <Button
                onClick={handleSupabaseConnect}
                disabled={isProcessing}
                className="w-full bg-gradient-primary shadow-elegant hover:shadow-glow transition-all duration-300"
                size="lg"
              >
                {isProcessing ? "Connecting..." : "Connect to Supabase"}
              </Button>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </section>
  );
};
