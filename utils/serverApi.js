import axios from "axios";
import { SERVER_BASE_URL } from "./constants";

const serverApi = axios.create({
  baseURL: SERVER_BASE_URL,
  timeout: 5000,
  // headers: { "X-Custom-Header": "foobar" },
});

export const postUpdate = () => {
  serverApi
    .post("/user/state?id=69", {
      traffic_light: {
        visible: true,
        multiple: true,
        non_pedestrian: true,
        red: true,
      }, /*
      position: {
        latitude: "40:7:22.8N",
        longitude: " 74:7:22.8W",
      }, */
    })
    .then((res) => {
      console.log("REQUEST SUCCESS", res);
      console.log(res.data);
    })
    .catch(err => { 
      console.log("REQUEST FAILURE", err);
    });
};

export async function postLocation(location) {
  serverApi
    .post("/user/state?id=69", {
      position: {
        latitude: location.latitude,
        longitude: location.longitude,
      }
    })
}

export default serverApi;
