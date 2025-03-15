import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useState } from "react";
import type { Subject } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newSubject, setNewSubject] = useState({
    name: "",
    description: "",
    imageUrl: "",
  });

  const { data: subjects, isLoading } = useQuery<Subject[]>({
    queryKey: ["/api/teacher/subjects"],
  });

  const createSubjectMutation = useMutation({
    mutationFn: async (data: typeof newSubject) => {
      const res = await apiRequest("POST", "/api/subjects", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/subjects"] });
      setNewSubject({ name: "", description: "", imageUrl: "" });
      toast({
        title: "Success",
        description: "Subject created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!user || user.role !== "teacher") {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>You need to be a teacher to view this page.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Teacher Dashboard</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Subject</CardTitle>
            <CardDescription>Add a new subject to teach</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createSubjectMutation.mutate(newSubject);
              }}
              className="space-y-4"
            >
              <div>
                <Input
                  placeholder="Subject Name"
                  value={newSubject.name}
                  onChange={(e) =>
                    setNewSubject({ ...newSubject, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Textarea
                  placeholder="Description"
                  value={newSubject.description}
                  onChange={(e) =>
                    setNewSubject({ ...newSubject, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Input
                  placeholder="Image URL"
                  value={newSubject.imageUrl}
                  onChange={(e) =>
                    setNewSubject({ ...newSubject, imageUrl: e.target.value })
                  }
                />
              </div>
              <Button type="submit">Create Subject</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {subjects?.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{subject.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {subject.description}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.location.href = `/subjects/${subject.id}`
                    }
                  >
                    Manage Content
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
