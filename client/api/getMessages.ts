import config from "./config";

export const getMessages = async (
  sessionId: string,
  limit: number = 50,
  offset: number = 0
) => {
  const response = await fetch(
    `${config.backendUrl}/messages/${sessionId}?limit=${limit}&offset=${offset}`
  );
  return response.json();
};
