import { redirect } from 'next/navigation';
import { MetricsPage } from '@/app/metrics/[hostname]/MetricsPage';

type PageProps = {
  params: { hostname: string }
};

export default async function Page({ params }: PageProps) {
  const { hostname } = params;

  if (!hostname) {
    redirect('/');
  }

  return <MetricsPage hostname={hostname} />;
}
