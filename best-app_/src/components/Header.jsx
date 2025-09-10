// Header.jsx
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { useAuthStore } from '../stores/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { apiLogout } from '../api/userApi';
import { BsHouse } from 'react-icons/bs';

export default function Header({ setShowLogin }) {
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
        <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary" fixed="top" bg="dark" data-bs-theme="dark">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    <span className="h2">
                        <BsHouse /> 숙소 이름
                    </span>
                    &nbsp;&nbsp;&nbsp;
                    {authUser && <span className="text-center"> {authUser.name} 님 로그인 중 ...</span>}
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                        {!authUser && (
                            <Nav.Link as={Link} to="/signup">
                                SingUp
                            </Nav.Link>
                        )}
                        {!authUser && <Nav.Link onClick={() => setShowLogin(true)}>SignIn</Nav.Link>}
                        {authUser && <Nav.Link onClick={handleLogout}>Logout</Nav.Link>}
                    </Nav>
                    <Nav>
                        <Nav.Link as={Link} to="/posts">
                            방명록
                        </Nav.Link>
                        {authUser && (
                            <Nav.Link eventKey={2} as={Link} to="/mypage">
                                MyPage
                            </Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}
