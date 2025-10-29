import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-subtle" />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Logo */}
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border shadow-soft">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Monk</span>
        </div>
        
        {/* Heading */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          From raw data to
          <br />
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            ready-to-train
          </span>
          <br />
          in one click
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
          AI-powered data preparation for LLM fine-tuning. Upload CSV or Excel, 
          let AI detect column meanings, export perfect .jsonl datasets.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 shadow-elegant hover:shadow-glow transition-all duration-300 bg-gradient-primary border-0"
          >
            Try It Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="text-lg px-8 py-6 backdrop-blur-sm bg-card/50 hover:bg-card/80 transition-all duration-300"
          >
            View Demo
          </Button>
        </div>
        
        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { value: "10K+", label: "Datasets Processed" },
            { value: "99.9%", label: "Accuracy Rate" },
            { value: "< 30s", label: "Avg. Processing Time" },
          ].map((stat) => (
            <div 
              key={stat.label}
              className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border shadow-soft hover:shadow-elegant transition-all duration-300"
            >
              <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
