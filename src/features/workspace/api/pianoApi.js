import axios from "axios";
import { API_BASE_URL } from "../../../config/api";

let pianoConfigRequest = null;

export const getPianoConfig = () => {
  if (!pianoConfigRequest) {
    pianoConfigRequest = axios
      .get(`${API_BASE_URL}/api/piano`)
      .then((response) => response.data)
      .catch((requestError) => {
        pianoConfigRequest = null;
        throw requestError;
      });
  }
  return pianoConfigRequest;
};
