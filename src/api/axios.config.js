import axios from "axios";

const instance = axios.create({
  baseURL:
    //"http://localhost:3000",
  "https://crm360autowrap-d14c80d68b09.herokuapp.com/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/*instance.defaults.headers.common["Authorization"] = "AUTH TOKEN";
instance.defaults.headers.post["Content-Type"] = "application/json";*/

instance.interceptors.request.use(
  (request) => {
    console.log(request);
    return request;
  },
  (error) => {
    console.log("erreur axios : " + error);
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    console.log(response);
    return response;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);

export default instance;
