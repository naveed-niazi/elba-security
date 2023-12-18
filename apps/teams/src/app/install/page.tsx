import { getAuthCodeUrlParameters } from '../api/auth';

const InstallPage = () => {
  const authCodeUrlParameters = getAuthCodeUrlParameters;

  return (
    <div>
      <a href={`https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${new URLSearchParams(authCodeUrlParameters).toString()}`}>
        Log in with Microsoft
      </a>
    </div>
  );
};

export default InstallPage;