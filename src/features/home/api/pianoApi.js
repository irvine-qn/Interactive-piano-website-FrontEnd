import apiClient from "../../../lib/axios";

let pianoConfigRequest = null;

export const getPianoConfig = () => {
  if (!pianoConfigRequest) {
    pianoConfigRequest = apiClient
      .get("/piano")
      .then((response) => response.data)
      .catch((requestError) => {
        pianoConfigRequest = null;
        throw requestError;
      });
  }
  return pianoConfigRequest;
};
