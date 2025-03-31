import config from "./config";

export const getSessionById = async (sessionId: string) => {
  const response = await fetch(`${config.backendUrl}/session/${sessionId}`);
  return response.json();
};

export default getSessionById;
