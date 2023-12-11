
import { MySaasError } from './commons/error';

export type MySaasUser = {
  id: string;
  username: string;
  email: string;
};

type GetUsersResponseData = { users: MySaasUser[]; nextPage: number | null };

export const getUsers = async (token: string, page: number | null) => {
  const response = await fetch(`https://mysaas.com/api/v1/users?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new MySaasError('Could not retrieve users', { response });
  }
  return response.json() as Promise<GetUsersResponseData>;
};