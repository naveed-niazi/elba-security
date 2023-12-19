
import { useRouter } from 'next/router';
import { getTokenFromCode, getUserDetails } from '../api/auth';

const SetupPage = () => {
  const router = useRouter();
  const { code } = router.query;

  if (code) {
    getTokenFromCode(code as any)
      .then((accessToken: string) => {
        return getUserDetails(accessToken);
      })
      .then((userDetails: any) => {
        console.log('User details:', userDetails);
        // Save user details and token to your database or state
      })
      .catch((error: any) => {
        console.error('Error in setup:', error);
      });
  }

  return <div>Setting up...</div>;
};

export default SetupPage;