import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle"; // Added import for theme toggle


export function NavHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Exam Bombers
          </h1>
        </Link>

        <div className="flex items-center gap-4">
          {user?.role === "teacher" && (
            <Link href="/teacher/dashboard">
              <Button variant="outline">Teacher Dashboard</Button>
            </Link>
          )}
          {user?.role === "admin" && (
            <Link href="/admin">
              <Button variant="outline">Admin Dashboard</Button>
            </Link>
          )}
          <Button variant="ghost" onClick={() => logout()}>
            Logout
          </Button>
          <ThemeToggle /> {/* Added Theme Toggle component */}
        </div>
      </div>
    </header>
  );
}

// Placeholder components -  These need to be implemented separately
export const ThemeProvider = ({ children }) => {
    //Implementation for theme provider using useContext and useState to manage theme state.
    return <>{children}</>;
};


export const ThemeToggle = () => {
  //Implementation for theme toggle button, likely using useState to toggle dark/light mode.
  return <button>Toggle Dark Mode</button>;
};