import { client } from './instance';
import { AgentsResponse } from '@/lib/responses/agents.response';
import { SetTimeDto } from '@/lib/dtos/set-time.dto';
import { ProcessSignalDto } from '@/lib/dtos/process-signal.dto';
import { AgentResponse } from '@/lib/responses/agent.response';
import { RemoveAgent } from '@/lib/responses/remove-agent';

class AgentAPI {
  async getByUser () {
    const { data } = await client.get<AgentsResponse>('/agents');
    return data;
  }

  async setTime (body: SetTimeDto) {
    const { data } = await client.post<void>('/agents/setTime', body);
    return data;
  }

  async sendSignal (body: ProcessSignalDto) {
    const { data } = await client.post<void>('/agents/sendSignal', body);
    return data;
  }

  async getById (id: number) {
    const { data } = await client.get<AgentResponse>(`/agents/${id}`);
    return data;
  }

  async removeByHostname (body: RemoveAgent) {
    const { data } = await client.post<void>('/agents/remove', body);
    return data;
  }
}

export default new AgentAPI();
