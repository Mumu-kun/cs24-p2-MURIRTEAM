import axios from "axios";

const baseURL = "http://localhost:8000/";

const axiosApi = axios.create({
	baseURL,
});

export default axiosApi;
