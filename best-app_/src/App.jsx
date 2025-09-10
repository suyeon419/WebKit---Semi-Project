import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import Header from './components/Header';
import Side from './components/Side';
import Footer from './components/Footer';
import Home from './pages/Home';
import PostApp from './pages/PostApp';
import PostView from './components/posts/PostView';
import PostEdit from './components/posts/PostEdit';
import LoginModal from './components/users/LoginModal';
import { useEffect, useState } from 'react';
import { useAuthStore } from './stores/authStore';
import axiosInstance from './api/axiosInstance';
import SignUp from './components/users/SignUp';
import UserListAdmin from './components/admin/UserListAdmin';
import MyPage from './components/users/MyPage';

function App() {
    const [showLogin, setShowLogin] = useState(false);

    const loginAuthUser = useAuthStore((s) => s.loginAuthUser);

    useEffect(() => {
        requestAuthUser();
    }, [loginAuthUser]);
    const requestAuthUser = async () => {
        try {
            const accessToken = sessionStorage.getItem('accessToken');
            if (accessToken) {
                const response = await axiosInstance.get(`/auth/user`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                const authUser = await response.data;
                loginAuthUser(authUser); //인증사용자 정보 전역 state에 설정 후 로딩상태 false
            }
        } catch (error) {
            console.error('accessToken 유효하지 않음: ', error);
            alert(error);
            sessionStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    };

    return (
        <>
            <div className="container fluid py-5">
                <BrowserRouter>
                    <Row>
                        <Col className="mb-5">
                            <Header setShowLogin={setShowLogin} />
                            {/* 로그인 모달 */}
                            <LoginModal show={showLogin} setShowLogin={setShowLogin} />
                        </Col>
                    </Row>
                    <Row className="main">
                        <Col>
                            {/* 라우트 */}
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/posts" element={<PostApp />} />
                                <Route path="/posts/:id" element={<PostView />} />
                                <Route path="/postEdit/:id" element={<PostEdit />} />
                                <Route path="/signup" element={<SignUp />} />
                                <Route path="/admin/users" element={<UserListAdmin />} />
                                <Route path="/mypage" element={<MyPage />} />
                            </Routes>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={12}></Col>
                    </Row>
                </BrowserRouter>
            </div>
            <Footer />
        </>
    );
}

export default App;
