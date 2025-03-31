import config from "./config";

const createSession = async (hostName: string) => {
  const response = await fetch(`${config.backendUrl}/session/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ hostName }),
  });

  return response.json();
};

export default createSession;
