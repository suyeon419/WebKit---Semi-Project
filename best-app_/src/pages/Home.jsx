// Home.jsx
import React from 'react';

export default function Home() {
    return (
        <div className="container text-center">
            <h1>숙소 이름</h1>
            <br />
            <img
                className="rounded"
                src="./image/숙소사진.png"
                alt="숙소사진"
                style={{
                    width: '100%',
                    height: '500px',
                    objectFit: 'cover',
                    objectPosition: 'center',
                }}
            />
        </div>
    );
}
