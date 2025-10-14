import { Loader2 } from "lucide-react";

const LoadingAnimation = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center fade-in">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
          <Loader2 className="w-8 h-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-lg font-medium text-foreground">Preparing your Skill Wallet...</p>
        <p className="text-sm text-muted-foreground mt-2">This will only take a moment</p>
      </div>
    </div>
  );
};

export default LoadingAnimation;
