import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Sparkles } from "lucide-react";
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

interface MappingSectionProps {
  fileName: string;
  mappingResult: MappingResult;
  file: File;
}

export const MappingSection = ({ fileName, mappingResult, file }: MappingSectionProps) => {
  const [promptColumn, setPromptColumn] = useState(mappingResult.mapping.prompt);
  const [completionColumn, setCompletionColumn] = useState(mappingResult.mapping.completion);

  const handleExport = async () => {
    try {
      const jsonlLines: string[] = [];
      
      // Get column indices
      const promptIdx = mappingResult.headers.indexOf(promptColumn);
      const completionIdx = mappingResult.headers.indexOf(completionColumn);

      if (promptIdx === -1 || completionIdx === -1) {
        toast.error("Please select valid prompt and completion columns");
        return;
      }

      // Parse the entire file
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      // Process all data rows (skip header)
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(cell => cell.trim().replace(/^["']|["']$/g, ''));
        
        if (row[promptIdx] && row[completionIdx]) {
          const jsonlEntry = {
            messages: [
              { role: "user", content: row[promptIdx] },
              { role: "assistant", content: row[completionIdx] }
            ]
          };
          jsonlLines.push(JSON.stringify(jsonlEntry));
        }
      }

      if (jsonlLines.length < 10) {
        toast.error(`Training file has ${jsonlLines.length} example(s), but must have at least 10 examples`);
        return;
      }

      const blob = new Blob([jsonlLines.join('\n')], { type: 'application/jsonl' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName.replace(/\.[^/.]+$/, '')}_finetuning.jsonl`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`JSONL file exported successfully with ${jsonlLines.length} examples!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to export file");
    }
  };

  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-4xl font-bold">AI Column Mapping</h2>
          </div>
          <p className="text-xl text-muted-foreground">
            Review and adjust the AI-detected column roles
          </p>
        </div>

        <Card className="p-8 border-border bg-card/50 backdrop-blur-sm shadow-elegant">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
              <div>
                <p className="text-sm font-medium text-muted-foreground">File</p>
                <p className="text-lg font-semibold">{fileName}</p>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {mappingResult.rowCount} rows
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Prompt Column (Input)
                </label>
                <Select value={promptColumn} onValueChange={setPromptColumn}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mappingResult.headers.map(header => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Completion Column (Output)
                </label>
                <Select value={completionColumn} onValueChange={setCompletionColumn}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mappingResult.headers.map(header => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {mappingResult.mapping.ignored_columns.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Ignored Columns</p>
                <div className="flex flex-wrap gap-2">
                  {mappingResult.mapping.ignored_columns.map(col => (
                    <Badge key={col} variant="outline">
                      {col}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
              <h3 className="text-sm font-medium mb-3">Preview (first 20 rows)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {mappingResult.headers.map(header => (
                        <th key={header} className="px-3 py-2 text-left font-medium">
                          {header}
                          {header === promptColumn && (
                            <Badge className="ml-2" variant="default">Prompt</Badge>
                          )}
                          {header === completionColumn && (
                            <Badge className="ml-2" variant="secondary">Completion</Badge>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mappingResult.sampleRows.map((row, i) => (
                      <tr key={i} className="border-b border-border/50">
                        {row.map((cell, j) => (
                          <td key={j} className="px-3 py-2 max-w-xs truncate">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Button
              onClick={handleExport}
              className="w-full bg-gradient-primary shadow-elegant hover:shadow-glow transition-all duration-300"
              size="lg"
            >
              <Download className="mr-2 h-5 w-5" />
              Export as JSONL
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};
