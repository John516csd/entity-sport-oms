/**
 * @see https://umijs.org/docs/max/access#access
 * */
import useUserStore from '@/stores/user';

export default function access() {
  const userInfo = useUserStore.getState().userInfo;

  return {
    canAdmin: userInfo?.is_admin === true,
  };
}
