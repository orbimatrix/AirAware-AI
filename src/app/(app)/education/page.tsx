import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEducationalContent } from "@/ai/flows/educational-content";
import { ContentDisplay } from "@/components/education/content-display";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Education",
};

async function ContentTab({ topic }: { topic: 'Climate Change' | 'Pollution Reduction' | 'Sustainable Living' }) {
    const content = await getEducationalContent({ topic });
    return <ContentDisplay content={content} />;
}

function ContentSkeleton() {
    return (
        <div className="mt-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="space-y-3 pt-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
            </div>
        </div>
    )
}

export default function EducationPage() {
  const topics: ('Climate Change' | 'Pollution Reduction' | 'Sustainable Living')[] = [
    'Pollution Reduction',
    'Sustainable Living',
    'Climate Change',
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Learn & Grow"
        description="AI-curated articles to help you understand key environmental topics."
      />
      <Tabs defaultValue={topics[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-10">
          {topics.map(topic => (
            <TabsTrigger key={topic} value={topic}>{topic}</TabsTrigger>
          ))}
        </TabsList>
        {topics.map(topic => (
          <TabsContent key={topic} value={topic}>
            <Suspense fallback={<ContentSkeleton />}>
                <ContentTab topic={topic} />
            </Suspense>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
