import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { 
  GraduationCap, 
  Brain, 
  BookOpen, 
  BarChart3, 
  Shield, 
  Zap,
  CheckCircle2 
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-block mb-6">
            <div className="bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium">
              AI-Powered Education Platform
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Transform Learning with
            <br />
            AI-Powered Tutoring
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Acadira provides institutions with a curriculum-trained AI tutor that offers personalized, 
            round-the-clock academic assistance to students.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/admin-login">
              <Button size="lg" className="shadow-glow">
                Get Started
              </Button>
            </Link>
            <Link to="/student-login">
              <Button size="lg" variant="outline">
                Student Access
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to enhance educational outcomes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-card transition-all bg-gradient-card">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Curriculum-Trained AI</h3>
              <p className="text-muted-foreground">
                AI tutor trained specifically on your institution's syllabus for accurate, 
                context-aware responses.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-card transition-all bg-gradient-card">
              <div className="p-3 rounded-lg bg-accent/10 w-fit mb-4">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">24/7 Student Support</h3>
              <p className="text-muted-foreground">
                Students get instant answers to their questions anytime, 
                complementing traditional teaching.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-card transition-all bg-gradient-card">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Usage Analytics</h3>
              <p className="text-muted-foreground">
                Track student engagement, identify knowledge gaps, and monitor 
                the most frequently asked topics.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-card transition-all bg-gradient-card">
              <div className="p-3 rounded-lg bg-accent/10 w-fit mb-4">
                <GraduationCap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Easy Curriculum Upload</h3>
              <p className="text-muted-foreground">
                Simple PDF and document upload process with automatic AI processing 
                of your syllabus materials.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-card transition-all bg-gradient-card">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                Enterprise-grade security with data isolation ensuring your 
                curriculum and student data stays protected.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-card transition-all bg-gradient-card">
              <div className="p-3 rounded-lg bg-accent/10 w-fit mb-4">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Instant AI responses powered by advanced language models, 
                delivering answers in seconds.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-muted-foreground text-lg">
              One plan, unlimited potential
            </p>
          </div>

          <Card className="max-w-md mx-auto p-8 shadow-card bg-gradient-card">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold mb-2">₹80,000</div>
              <div className="text-muted-foreground">per year</div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <span>Unlimited student accounts</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <span>Curriculum upload & management</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <span>Advanced analytics dashboard</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <span>24/7 AI tutor access</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <span>Priority support</span>
              </li>
            </ul>

            <Link to="/admin-login" className="block">
              <Button size="lg" className="w-full">
                Get Started Today
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 Acadira by Xovaxy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
