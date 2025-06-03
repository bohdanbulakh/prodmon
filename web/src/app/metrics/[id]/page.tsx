import { redirect } from 'next/navigation';
import { MetricsPage } from '@/app/metrics/[id]/MetricsPage';

type PageProps = {
  params: Promise<{ id: string }>
};

export default async function Page ({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    redirect('/');
  }

  return <MetricsPage agentId={id} apiUrl={process.env.NEXT_API_URL ?? 'api.prodmon.me'}/>;
}
