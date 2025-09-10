// Side.jsx
import { Stack, Button, ListGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { apiLogout } from '../api/userApi';

export default function Side({ setShowLogin }) {
    const authUser = useAuthStore((s) => s.authUser);
    const logout = useAuthStore((s) => s.logout);
    const navigate = useNavigate();

    const handleLogout = async () => {
        if (!authUser) return;
        try {
            //api요청
            const response = await apiLogout({ email: authUser.email });
            //alert(JSON.stringify(response));
            if (response.result === 'success') {
                logout();
                sessionStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                navigate('/');
            }
        } catch (error) {
            alert('로그아웃 처리 중 에러: ' + error.message);
        }
    };
    const handleAuthTest = async () => {};

    return (
        <Stack gap={2} className="mx-auto w-100">
            {authUser && (
                <div className="alert alert-danger text-center">
                    {' '}
                    {authUser.name} 님 로그인 중 ...
                    <br />
                    {authUser.email} <br></br>[{authUser.role}]
                </div>
            )}
        </Stack>
    );
}
