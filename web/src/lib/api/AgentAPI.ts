import { client } from './instance';
import { AgentsResponse } from '@/lib/responses/agents.response';

class AgentAPI {
  async getByUser () {
    const { data } = await client.get<AgentsResponse>('/agents');
    return data;
  }
}

export default new AgentAPI();
