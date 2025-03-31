import config from "./config";

const endSession = async (sessionId: string) => {
  const response = await fetch(`${config.backendUrl}/session/${sessionId}/end`, {
    method: "PUT",
  });
  return response.json();
};

export default endSession;
