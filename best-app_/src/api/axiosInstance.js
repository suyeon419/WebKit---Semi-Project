import axios from 'axios';
//사용자 인증이나 인가가 필요없는 서비스 요청시 사용
const axiosInstance = axios.create({
    baseURL: `http://localhost:7777/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});
export default axiosInstance;
