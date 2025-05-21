import Link from 'next/link';

export default async function Home () {
  let hostnames: string[] = [];
  let error: Error | null = null;

  try {
    const response = await fetch(`https://${process.env.NEXT_API_URL}/hosts`, {
      method: 'GET',
    });

    hostnames = await response.json();
  } catch (err: any) {
    error = err
  }

  if (error) return <p className="p-4 text-red-500">Error: {error?.message}</p>;

  return (
    <div className="space-y-8 p-4">
      {hostnames.map((hostname) =>
        <div key={hostname}>
          <Link
            href={`/metrics/${hostname}`}
            className="text-blue-600 hover:underline"
          >
            {hostname}
          </Link>
        </div>,
      )}
    </div>
  );
}
