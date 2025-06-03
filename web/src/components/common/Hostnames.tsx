import { AgentsResponse } from '@/lib/responses/agents.response';
import { Card, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

type Props = {
  isLoading: boolean
  data? : AgentsResponse
};

export default function Hostnames ({
  isLoading, data,
}: Props) {
  return !isLoading && data && (data.map(({ id, hostname }) => (
    <Card key={hostname} className="p-5 text-center min-w-fit">
      <CardTitle>
        <Link href={`/metrics/${id}`} className="text-primary">
          {hostname}
        </Link>
      </CardTitle>
    </Card>
  )));
}
