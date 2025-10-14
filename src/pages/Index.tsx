//src/pages/Index.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wallet, Menu, X } from "lucide-react";
import LoadingAnimation from "@/components/LoadingAnimation";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // const handleGetStarted = () => {
  //   setIsLoading(true);
  //   setTimeout(() => {
  //     navigate("/wizard");
  //   }, 3000);
  // };
  const handleGetStarted = () => {
    navigate('/login');
  };

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Skill Wallet</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <a href="#jobseekers" className="text-muted-foreground hover:text-foreground transition-colors">
                For Jobseekers
              </a>
              <a href="#hr" className="text-muted-foreground hover:text-foreground transition-colors">
                For HR
              </a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <Button onClick={() => navigate("/login")} variant="outline" className="hidden md:inline-flex">
                HR Login
              </Button>
              <Button onClick={handleGetStarted} className="hidden md:inline-flex">
                Login as Jobseeker
              </Button>
              <button
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 space-y-2 fade-in">
              <a href="#about" className="block py-2 text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <a href="#jobseekers" className="block py-2 text-muted-foreground hover:text-foreground transition-colors">
                For Jobseekers
              </a>
              <a href="#hr" className="block py-2 text-muted-foreground hover:text-foreground transition-colors">
                For HR
              </a>
              <a href="#contact" className="block py-2 text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
              <Button onClick={() => navigate("/login")} variant="outline" className="w-full mt-2">
                HR Login
              </Button>
              <Button onClick={handleGetStarted} className="w-full mt-2">
                Login as Jobseeker
              </Button>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Your Skills, Simplified.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Upload once. Share everywhere. Get hired faster with Skill Wallet.
          </p>

          {/* Illustration */}
          <div className="mb-12 flex justify-center">
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
              <div className="absolute inset-4 bg-primary/20 rounded-full animate-pulse delay-75" />
              <div className="absolute inset-8 bg-card rounded-full shadow-lg flex items-center justify-center">
                <Wallet className="w-24 h-24 text-primary" />
              </div>
            </div>
          </div>

          <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-6 hover-lift">
            Login as Jobseeker
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon="🎓"
              title="Centralized Profile"
              description="Store all your education, certifications, and work experience in one place"
            />
            <FeatureCard
              icon="⚡"
              title="Quick Sharing"
              description="Share your complete profile with recruiters instantly with a single link"
            />
            <FeatureCard
              icon="✨"
              title="Stand Out"
              description="Showcase your projects, skills, and achievements in a beautiful format"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Skill Wallet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <div className="bg-card p-6 rounded-lg hover-lift">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Index;
