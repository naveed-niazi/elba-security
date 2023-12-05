import { DropboxResponseError } from 'dropbox';
import { NonRetriableError, RetryAfterError } from 'inngest';

export const errorMessages: {
  [key: string]: string;
} = {
  expired_access_token: 'Dropbox Access token is expired, you should re-authenticate the user',
  invalid_select_admin: 'Dropbox iInvalid admin account, you should re-authenticate the user',
  shared_link_access_denied: "Dropbox user doesn't have permissions to remove this shared link",
  shared_folder_access_denied:
    "Dropbox user doesn't have permissions to remove this shared folder permissions",
  invalid_id: 'Dropbox invalid user permission or Invalid shared folder/file ID.',
  user_suspended: 'Dropbox user is suspended',
  other: 'Dropbox other error',
};

export const handleError = (error: unknown) => {
  if (error instanceof DropboxResponseError) {
    const { status, headers, error: errorDetails } = error;

    if (status === 429) {
      const retryAfter = headers['Retry-After'] ?? 30;

      throw new RetryAfterError('Dropbox rate limit reached', retryAfter * 1000);
    }

    if (status === 401) {
      const { error_summary, error: error_tag } = errorDetails;
      const errorTag = error_tag['.tag'];
      const message = errorTag ? errorMessages[errorTag] : errorDetails || error_summary;

      if (
        [
          'invalid_access_token',
          'missing_scope',
          'expired_access_token',
          'invalid_select_admin',
        ].includes(errorTag)
      ) {
        throw new NonRetriableError(message, {
          cause: error,
        });
      }
    }
    throw error;
  }
};
