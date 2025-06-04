import { client } from './instance';
import { AgentsResponse } from '@/lib/responses/agents.response';
import { SetTimeDto } from '@/lib/dtos/set-time.dto';
import { ProcessSignalDto } from '@/lib/dtos/process-signal.dto';

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
}

export default new AgentAPI();
