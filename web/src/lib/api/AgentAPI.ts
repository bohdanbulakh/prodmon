import { client } from './instance';
import { AgentsDto } from '@/lib/dtos/agents.dto';

class AgentAPI {
  async getByUser () {
    const { data } = await client.get<AgentsDto>('/agents');
    return data;
  }
}

export default new AgentAPI();
