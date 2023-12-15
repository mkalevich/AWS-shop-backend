const getAuthToken = (authHeader: string) => {
  const matchBase64 = authHeader.match(/^Basic (.+)$/);

  if (matchBase64) {
    return matchBase64[1];
  } else {
    return "";
  }
};

export const handler = async (event: any) => {
  const authHeader = event.headers && event.headers.Authorization;

  if (!authHeader) {
    return { statusCode: 401, body: "No Authorization header" };
  }

  const authToken = getAuthToken(authHeader);

  const decodedCredentials = Buffer.from(authToken, "base64").toString("utf8");
  console.log("Decoded credentials ", decodedCredentials);

  const [login, password] = decodedCredentials.split(":");
  console.log("Login&Password ", login, password);

  if (
    login === process.env.GITHUB_LOGIN &&
    password === process.env.GITHUB_PASSWORD
  ) {
    return { statusCode: 200, body: "Authorization completed" };
  } else {
    return { statusCode: 403, body: "Authorization token is not valid" };
  }
};
