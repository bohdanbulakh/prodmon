import Link from 'next/link';
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card';

export default async function Home () {
  let hostnames: string[] = [];
  let error: Error | null = null;

  try {
    const response = await fetch(`https://${process.env.NEXT_API_URL}/hosts`, {
      method: 'GET',
      cache: 'no-store',
    });

    hostnames = await response.json();
  } catch (err) {
    error = err as Error;
  }

  if (error) return <p className="p-4 text-red-500">Error: {error?.message}</p>;

  return (
    <div className="space-y-6 p-4 min-w-fit">
      <Card className="mx-auto w-full max-w-1/2 min-w-fit">
        <CardHeader>
          <h1 className="text-2xl font-bold tracking-tight">Available Hosts</h1>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-fit">
          {hostnames.map((hostname) => (
            <Card key={hostname} className="p-5 text-center min-w-fit">
              <CardTitle>
                <Link href={`/metrics/${hostname}`} className="text-primary">
                  {hostname}
                </Link>
              </CardTitle>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
