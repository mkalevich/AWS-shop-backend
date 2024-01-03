interface AuthResponse {
  principalId: string;
  policyDocument?: {
    Version: string;
    Statement: {
      Action: string;
      Effect: string;
      Resource: string;
    }[];
  };
}

const generatePolicy = (
  principalId: string,
  effect: string,
  resource: string
): AuthResponse => {
  if (effect && resource) {
    return {
      principalId,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: effect,
            Resource: resource,
          },
        ],
      },
    };
  } else {
    return { principalId };
  }
};

const getAuthToken = (authHeader: string) => {
  const matchBase64 = authHeader.match(/^Basic (.+)$/);

  if (matchBase64) {
    return matchBase64[1];
  } else {
    return "";
  }
};

export const handler = async (event: any, context: any, callback: any) => {
  const authHeader = event.headers && event.headers.Authorization;
  console.log(authHeader);
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
    return generatePolicy(
      "user",
      "Allow",
      `arn:aws:execute-api:${process.env.BASE_AWS_REGION}:946060570212:*/*/*`
    );
  } else {
    throw new Error("Unauthorized");
  }
};
