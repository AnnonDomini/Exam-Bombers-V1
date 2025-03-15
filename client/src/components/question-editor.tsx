import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import type { InsertQuestion } from "@shared/schema";

export function QuestionEditor({ topicId }: { topicId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createQuestionMutation = useMutation({
    mutationFn: async (data: InsertQuestion) => {
      const res = await apiRequest("POST", `/api/topics/${topicId}/questions`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/topics/${topicId}/questions`] });
      setIsOpen(false);
      setQuestion({ question: "", options: ["", "", "", ""], correctAnswer: 0 });
      toast({
        title: "Success",
        description: "Question added successfully",
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
    createQuestionMutation.mutate({
      topicId,
      ...question,
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    setQuestion({ ...question, options: newOptions });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add New Question</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Quiz Question</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Question"
              value={question.question}
              onChange={(e) => setQuestion({ ...question, question: e.target.value })}
            />
          </div>
          {question.options.map((option, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
              />
              <Button
                type="button"
                variant={question.correctAnswer === index ? "default" : "outline"}
                onClick={() => setQuestion({ ...question, correctAnswer: index })}
              >
                Correct
              </Button>
            </div>
          ))}
          <Button type="submit" className="w-full">
            Add Question
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
