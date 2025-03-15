import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TopicEditor } from "@/components/topic-editor";
import { useAuth } from "@/lib/auth";
import { QuestionEditor } from "@/components/question-editor";
import type { Subject, Topic, Progress as ProgressType, Question } from "@shared/schema";

export default function SubjectPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: subject } = useQuery<Subject>({
    queryKey: [`/api/subjects/${id}`],
  });

  const { data: topics } = useQuery<Topic[]>({
    queryKey: [`/api/subjects/${id}/topics`],
  });

  if (!subject || !topics) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{subject.name}</h1>
        <p className="text-lg text-muted-foreground">{subject.description}</p>
        {user?.role === "teacher" && (
          <div className="mt-4">
            <TopicEditor subjectId={parseInt(id)} />
          </div>
        )}
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {topics.map((topic) => (
          <TopicItem key={topic.id} topic={topic} isTeacher={user?.role === "teacher"} />
        ))}
      </Accordion>
    </div>
  );
}

function TopicItem({ topic, isTeacher }: { topic: Topic; isTeacher: boolean }) {
  const { data: progress } = useQuery<ProgressType>({
    queryKey: [`/api/topics/${topic.id}/progress`],
  });

  const { data: questions } = useQuery<Question[]>({
    queryKey: [`/api/topics/${topic.id}/questions`],
  });

  return (
    <AccordionItem value={topic.id.toString()}>
      <AccordionTrigger className="text-xl">
        <div className="flex items-center gap-4">
          <span>{topic.name}</span>
          {progress && (
            <Progress value={progress.score} className="w-24" />
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="prose dark:prose-invert mt-4">
          <p>{topic.content}</p>
          <div className="mt-4 flex gap-4">
            {questions && questions.length > 0 ? (
              <Link href={`/topics/${topic.id}/quiz`}>
                <Button>Start Quiz</Button>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">No questions available yet</p>
            )}
            {isTeacher && (
              <>
                <QuestionEditor topicId={topic.id} />
                <Link href={`/topics/${topic.id}/edit`}>
                  <Button variant="outline">Edit Topic</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}