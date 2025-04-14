/**
 * @see https://umijs.org/docs/max/access#access
 * */
import useUserStore from '@/stores/user';

export default function access() {
  const userInfo = useUserStore.getState().userInfo;
  console.log('🚀 ~ access ~ userInfo:', userInfo);

  return {
    canAdmin: userInfo?.is_admin === true,
  };
}
