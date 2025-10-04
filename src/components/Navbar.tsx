import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-lg bg-gradient-primary group-hover:shadow-glow transition-all">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Acadira
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/student-login">
            <Button variant="ghost">Student Login</Button>
          </Link>
          <Link to="/admin-login">
            <Button>Admin Login</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
