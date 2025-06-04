import { Card, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import DeleteButton from '@/app/(main)/components/DeleteButton';
import { useQuery } from '@tanstack/react-query';
import AgentAPI from '@/lib/api/AgentAPI';

export default function Hostnames () {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryFn: () => AgentAPI.getByUser(),
    queryKey: ['agents'],
  });

  if (error) return <p className="p-4 text-red-500">Error: {error?.message}</p>;

  return !isLoading && data && (data.map(({ id, hostname }) => (
    <Card key={hostname} className="p-5 text-center min-w-fit">
      <CardTitle className="flex content-center justify-center">
        <Link href={`/metrics/${id}`} className="text-center p-2">
          {hostname}
        </Link>
        <DeleteButton hostname={hostname}/>
      </CardTitle>
    </Card>
  )));
}
