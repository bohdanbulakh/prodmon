import { redirect } from 'next/navigation';
import { MetricsPage } from '@/app/metrics/[hostname]/MetricsPage';

type PageProps = {
  params: Promise<{ hostname: string }>
};

export default async function Page ({ params }: PageProps) {
  const { hostname } = await params;

  if (!hostname) {
    redirect('/');
  }

  return <MetricsPage hostname={hostname} apiUrl={process.env.NEXT_API_URL ?? 'api.mtsd-lab4.pp.ua'}/>;
}
