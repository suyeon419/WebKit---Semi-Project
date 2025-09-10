// axiosAuthInstance.js
// 사용자 인증이나 인가가 필요한 api요청시 사용
import axios from 'axios';
import { checkTokenExpiration, refreshAccessToken } from '../utils/authUtils';

const axiosAuthInstance = axios.create({
    baseURL: `http://localhost:7777/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});
export default axiosAuthInstance;
//인터셉터 (interceptor) : 요청을 서버로 보내기 직전에 실행되어 요청 내용을 검증하거나 조작하거나 하는 일을 수행
//[1] 요청 인터셉터  : 요청 보내기 전에 사전처리
//[2] 응답 인터셉터 : 서버로부터 응답을 받았을 때 브라우저에 출력하기 전에 그 응답을 가로채서 처리하는 역할 수행

// [1] 요청 인터셉터
axiosAuthInstance.interceptors.request.use(
    async (config) => {
        //config=> 요청 설정 객체
        //accessToken을 sessionStorage에서 꺼내서 유효한 토큰인지 체크
        const accessToken = sessionStorage.getItem('accessToken');
        console.log('요청 인터셉터 싫행중...accessToken: ' + accessToken);
        if (accessToken) {
            //유효한 토큰인지 체크
            if (checkTokenExpiration(accessToken)) {
                console.log(`요청 인터셉터: 유효하지 않은 토큰인 경우`);

                //유효하지 않은 토큰이면 true를 반환
                //[1] 유효하지 않은 경우=> refreshToken을 서버에 보내서 새로운 accessToken을 발급받자
                const newAccessToken = await refreshAccessToken();
                console.log(`새 억세스 토큰 받음: ${newAccessToken}`);
                if (newAccessToken) {
                    sessionStorage.setItem('accessToken', newAccessToken);
                    config.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return config;
                } /////////////////
                return config;
            } //if----
            //[2] 유효한 경우라면
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }

        return config; //config를 반환하지 않으면 요청이 진행되지 않거나 에러 발생
    },
    (err) => {
        console.error('요청 인터셉터 에러: ', err);
        Promise.reject(err);
    }
);

//[2] 응답 인터셉터
axiosAuthInstance.interceptors.response.use(
    (res) => res,
    async (err) => {
        const status = err.response?.status;
        console.log(`응답 인터셉터에서 받은 응답 status: ${status}`);
        if (status === 400) {
            alert(err.response.data?.message);
            window.location.href = '/';
            return Promise.reject(err);
        }
        if (status === 401) {
            //인증받지 않은 사용자인 경우 => refreshToken보내서 새 억세스 토큰 받기
            try {
                const newAccessToken = await refreshAccessToken();
                console.log(`새 억세스 토큰 받음: ${newAccessToken}`);
                if (newAccessToken) {
                    sessionStorage.setItem('accessToken', newAccessToken);
                    err.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return axiosAuthInstance(err.config); //원래 요청 재시도
                } /////////////////
            } catch (error) {
                console.error(error); //리프레시토큰이 유효하지 않은 경우
            }
            localStorage.removeItem('refreshToken');
            sessionStorage.removeItem('accessToken');
            window.location.href = '/';
            return Promise.reject(err);
        }
        if (status === 403) {
            //인가받지 않은 사용자인 경우 (권한이 없는 경우)
            alert('접근 권한이 없습니다');
            window.location.href = '/';
            return Promise.reject(err);
        }
    }
);
