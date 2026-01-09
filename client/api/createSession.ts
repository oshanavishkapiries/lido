import config from "./config";

const createSession = async (sessionName: string, hostName: string) => {
  console.log(config.backendUrl);
  const response = await fetch(`${config.backendUrl}/session/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionName, hostName }),
  });

  return response.json();
};

export default createSession;
