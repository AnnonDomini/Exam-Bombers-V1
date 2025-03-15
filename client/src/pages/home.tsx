import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Subject } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: subjects, isLoading } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Science Revision
        </h1>
        {user?.role === "admin" && (
          <Link href="/admin">
            <Button variant="outline">Admin Dashboard</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects?.map((subject) => (
          <Link key={subject.id} href={`/subjects/${subject.id}`}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{subject.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                  <img
                    src={subject.imageUrl}
                    alt={subject.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-muted-foreground">
                  {subject.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}