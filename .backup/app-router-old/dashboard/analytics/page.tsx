import SentimentCard from '@/components/SentimentCard';
import LineageCard from '@/components/LineageCard';
import SentimentHistogram from '@/components/SentimentHistogram';

export default function AnalyticsPage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <SentimentCard windowMin={180} />
        <LineageCard />
      </div>
      <SentimentHistogram hours={24} />
    </main>
  );
}
