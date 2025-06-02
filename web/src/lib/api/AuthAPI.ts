import { client } from './instance';
import { AuthDto } from '@/lib/dtos/auth.dto';

class AuthAPI {
  async register (body: AuthDto) {
    const { data } = await client.post<void>('/register', body);
    return data;
  }

  async login (body: AuthDto) {
    const { data } = await client.post<void>('/login', body);
    return data;
  }

  async logout () {
    const { data } = await client.post<void>('/logout');
    return data;
  }
}

export default new AuthAPI();
