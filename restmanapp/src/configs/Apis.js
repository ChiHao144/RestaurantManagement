import axios from "axios";

const BASE_URL = "http://192.168.1.104:8000/";

export const endpoints = {
    'categories': '/categories/',
    'dishes': '/dishes/'
}

export default axios.create({
    baseURL: BASE_URL
})
