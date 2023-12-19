// // auth.js
// import { ConfidentialClientApplication } from '@azure/msal-node';

// const msalConfig = {
//   auth: {
//     clientId: '652cce14-b63e-4926-8235-6949e4455e44',
//     redirectUri: 'http://localhost:3000/setup',
//     // clientSecret: 'VgT8Q~C2lvO57obYO1mX1Z2iRZ1by0yVlo9u6c~a',
//     // authority: 'https://login.microsoftonline.com/2d8b8525-019f-4b55-9110-6c058df772eb',
//   },
// };

// const msalClient = new ConfidentialClientApplication(msalConfig);

// export const loginRequest = {
//   scopes: ['User.ReadWrite'],
//   // redirectUri: 'http://localhost:3000/setup', // Set your redirect URI
// };

// export async function getTokenFromCode(authCode: string) {
//   const tokenRequest = {
//     code: authCode,
//     scopes: ['User.Read'],
//     redirectUri: 'http://localhost:3000/setup', // Set your redirect URI
//     clientId: '652cce14-b63e-4926-8235-6949e4455e44',
//   };

//   try {
//     const response = await msalClient.acquireTokenByCode(tokenRequest);
//     return response.accessToken;
//   } catch (error) {
//     console.error('Error acquiring token:', error);
//     throw error;
//   }
// }

// export async function getUserDetails(accessToken: string) {
//   const graphApiEndpoint = 'https://graph.microsoft.com/v1.0/me';

//   try {
//     const response = await fetch(graphApiEndpoint, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });

//     return await response.json();
//   } catch (error) {
//     console.error('Error getting user details:', error);
//     throw error;
//   }
// }
