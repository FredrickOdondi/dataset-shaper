import { Upload, Brain, Download, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Upload,
    title: "Easy Upload",
    description: "Drag and drop CSV or Excel files. Support for PostgreSQL connections coming soon.",
  },
  {
    icon: Brain,
    title: "AI-Powered Detection",
    description: "Advanced AI automatically detects prompt, completion, and metadata columns.",
  },
  {
    icon: Zap,
    title: "Smart Mapping",
    description: "Review and adjust AI suggestions with an intuitive interface.",
  },
  {
    icon: Download,
    title: "Export Ready",
    description: "Download perfectly formatted .jsonl files optimized for fine-tuning.",
  },
];

export const Features = () => {
  return (
    <section className="py-24 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything you need to prepare training data
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Monk streamlines your workflow from raw data to production-ready datasets
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.title}
                className="border-border bg-card/50 backdrop-blur-sm hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 shadow-soft">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
