// PostView.jsx
//useParams, useSearchParams
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePostStore } from '../../stores/postStore';
import { useAuthStore } from '../../stores/authStore';
import { useEffect } from 'react';

export default function PostView() {
    const { id } = useParams(); //type: string
    const navigate = useNavigate();

    const authUser = useAuthStore((s) => s.authUser);

    const deletePost = usePostStore((s) => s.deletePost);

    //useEffect 훅에서 글번호로 게시글 가져오는 함수 호출 (usePostStore)
    const post = usePostStore((s) => s.post);
    const fetchPostById = usePostStore((s) => s.fetchPostById);
    const postErr = usePostStore((s) => s.postErr);
    const resetPostErr = usePostStore((s) => s.resetPostErr);

    useEffect(() => {
        if (id) fetchPostById(id);
    }, [id]);

    useEffect(() => {
        if (postErr) {
            alert(postErr);
            resetPostErr();
            navigate('/posts');
        }
    }, [postErr]);

    // if (postErr) {
    //     alert(postErr);
    //     navigate('/posts');
    //     return <></>;
    // }

    const handleDelete = async (pid, e) => {
        //alert(pid + '/' + e);
        if (authUser?.email !== post.name) {
            e.preventDefault();
            alert('작성자만 삭제 가능합니다');
            return;
        }
        const yn = confirm(`${pid}번 글을 정말 삭제할까요?`);
        if (!yn) return;
        //
        const result = await deletePost(pid);
        if (result) {
            alert('글이 삭제되었습니다');
            navigate('/posts');
        } else {
            alert('글 삭제 실패');
        }
        // await fetchPostList();
    };
    const go = (e) => {
        if (authUser?.email !== post.name) {
            e.preventDefault();
            alert('작성자만 수정 가능합니다');
        }
    };

    if (!post)
        return (
            <div className="text-center">
                <h3>Loading ....</h3>
            </div>
        );

    return (
        <div className="post-view">
            <div className="row my-3">
                <div className="col-md-10 offset-md-1 px-3">
                    <h1 className="my-5 text-center"> {post.title} </h1>

                    <div className="text-end my-2">
                        {authUser?.email === post.name && (
                            <Link to={`/postEdit/${id}`} onClick={go}>
                                <button className="btn btn-secondary mx-2">수정</button>
                            </Link>
                        )}
                        {authUser?.email === post.name && (
                            <button className="btn btn-danger" onClick={(e) => handleDelete(id, e)}>
                                삭제
                            </button>
                        )}
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <div style={{ marginBottom: '1rem' }} className="text-center">
                                <img
                                    src={`http://localhost:7777/uploads/${post.file ?? 'noimage.png'}`}
                                    alt={`${post.file ?? 'noimage'}`}
                                    style={{ maxWidth: '100%', borderRadius: '0.5rem' }}
                                />
                            </div>
                            <div className="cArea px-5">{post.content}</div>
                        </div>
                        <div className="card-footer">
                            Created on [{post.wdate}] by {post.name}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
