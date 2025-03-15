import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import type { Topic } from "@shared/schema";

export function TopicEditor({ subjectId }: { subjectId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState({
    name: "",
    content: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTopicMutation = useMutation({
    mutationFn: async (data: typeof topic) => {
      const res = await apiRequest("POST", `/api/subjects/${subjectId}/topics`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/subjects/${subjectId}/topics`] });
      setIsOpen(false);
      setTopic({ name: "", content: "" });
      toast({
        title: "Success",
        description: "Topic created successfully",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTopicMutation.mutate(topic);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add New Topic</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Topic</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Topic Name"
              value={topic.name}
              onChange={(e) => setTopic({ ...topic, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Topic Content"
              value={topic.content}
              onChange={(e) => setTopic({ ...topic, content: e.target.value })}
              rows={5}
            />
          </div>
          <Button type="submit" className="w-full">
            Create Topic
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
