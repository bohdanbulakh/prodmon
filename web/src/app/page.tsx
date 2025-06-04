'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import AgentAPI from '@/lib/api/AgentAPI';
import { useAuthentication } from '@/hooks/useAuthentication';
import ProjectInfo from '@/app/(main)/components/ProjectInfo';
import Hostnames from '@/app/(main)/components/Hostnames';

export default function Home () {
  const { loggedIn } = useAuthentication();

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryFn: () => AgentAPI.getByUser(),
    queryKey: ['agents', loggedIn],
    enabled: loggedIn,
  });

  if (error) return <p className="p-4 text-red-500">Error: {error?.message}</p>;

  return (
    <div className="space-y-6 p-4 min-w-fit">
      {
        loggedIn ?
          <Card className="mx-auto w-full max-w-1/2 min-w-fit">
            <CardHeader>
              <h1 className="text-2xl font-bold tracking-tight">Доступні хости</h1>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-fit">
              <Hostnames data={data} isLoading={isLoading}/>
            </CardContent>
          </Card> : <ProjectInfo/>
      }
    </div>
  );
}
