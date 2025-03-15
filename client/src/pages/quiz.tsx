import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Question } from "@shared/schema";

export default function Quiz() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const { data: questions } = useQuery<Question[]>({
    queryKey: [`/api/topics/${id}/questions`],
  });

  const submitMutation = useMutation({
    mutationFn: async (score: number) => {
      const res = await fetch(`/api/topics/${id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: parseInt(id),
          score,
          completed: true,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit score");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/topics/${id}/progress`] });
      toast({
        title: "Quiz completed!",
        description: "Your progress has been saved.",
      });
    },
  });

  if (!questions) return <div>Loading...</div>;

  const currentQ = questions[currentQuestion];
  if (!currentQ && !showResults) return null;

  const handleAnswer = (value: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = parseInt(value);
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(curr => curr + 1);
    } else {
      // Calculate score
      const correct = selectedAnswers.reduce((acc, ans, idx) => {
        return acc + (ans === questions[idx].correctAnswer ? 1 : 0);
      }, 0);
      const score = Math.round((correct / questions.length) * 100);
      setFinalScore(score);
      setShowResults(true);
      submitMutation.mutate(score);
    }
  };

  if (showResults) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold mb-2">{finalScore}%</p>
              <p className="text-muted-foreground">
                You got {selectedAnswers.filter((ans, idx) => ans === questions[idx].correctAnswer).length} out of {questions.length} questions correct
              </p>
            </div>
            <Button className="w-full" onClick={() => navigate(`/subjects/${id}`)}>
              Return to Topic
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardContent className="pt-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
              Question {currentQuestion + 1} of {questions.length}
            </h2>
            <p className="text-lg mb-4">{currentQ.question}</p>
          </div>

          <RadioGroup
            value={selectedAnswers[currentQuestion]?.toString()}
            onValueChange={handleAnswer}
            className="space-y-4"
          >
            {currentQ.options.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                <Label htmlFor={`option-${idx}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>

          <Button
            className="mt-6"
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestion] === undefined}
          >
            {currentQuestion < questions.length - 1 ? "Next" : "Finish"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}