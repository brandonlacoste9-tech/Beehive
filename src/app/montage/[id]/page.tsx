import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { notFound } from 'next/navigation';

export default async function MontagePage({ params }: { params: { id: string } }) {
  const { data, error } = await supabaseAdmin
    .from('montages')
    .select('*')
    .eq('id', params.id)
    .single();
  if (error || !data) return notFound();

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Montage</h1>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Ritual: {data.ritual} • {new Date(data.created_at).toLocaleString()}
        </div>
        <div className="flex gap-2">
          <a
            className="text-sm px-3 py-1 rounded-lg border bg-white hover:bg-gray-50"
            href={`/api/montage/${data.id}/export?format=md`}
          >
            Export .md
          </a>
          <a
            className="text-sm px-3 py-1 rounded-lg border bg-white hover:bg-gray-50"
            href={`/api/montage/${data.id}/export?format=json`}
          >
            Export .json
          </a>
        </div>
      </div>
      <div className="rounded-2xl p-5 bg-white shadow">
        <div className="font-semibold">Topic / Audience</div>
        <div className="text-gray-700">
          {data.topic} / {data.audience}
        </div>
      </div>
      <div className="rounded-2xl p-5 bg-white shadow">
        <div className="font-semibold mb-2">Sentiment Snapshot</div>
        <pre className="whitespace-pre-wrap text-sm">
          {JSON.stringify(data.sentiment, null, 2)}
        </pre>
      </div>
      <div className="rounded-2xl p-5 bg-white shadow">
        <div className="font-semibold mb-2">Beat-Sheet</div>
        <pre className="whitespace-pre-wrap text-sm">{data.result}</pre>
      </div>
    </main>
  );
}
