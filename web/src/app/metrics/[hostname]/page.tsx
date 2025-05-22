import { redirect } from 'next/navigation';
import { MetricsPage } from '@/app/metrics/[hostname]/MetricsPage';

type PageProps = {
  params: Promise<{ hostname: string }>
};

export default async function Page({ params }: PageProps) {
  const { hostname } = await params;
  const url = `ws://${process.env.NEXT_API_URL}/metrics/${hostname}`

  if (!hostname) {
    redirect('/');
  }

  return <MetricsPage hostname={hostname} url={url} />;
}
