/**
 * @see https://umijs.org/docs/max/access#access
 * */
import { User } from './services/user';

export default function access(initialState: { currentUser?: User }) {
  const { currentUser } = initialState || {};
  console.log('🚀 ~ access check ~ userInfo:', currentUser);

  return {
    canAdmin: Boolean(currentUser?.is_admin),
    canUser: !!currentUser,
  };
}
