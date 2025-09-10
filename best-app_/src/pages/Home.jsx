// Home.jsx
import React from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import { BsBusFront } from 'react-icons/bs';
import { BsCalendar2Check } from 'react-icons/bs';
import { BsFillMegaphoneFill } from 'react-icons/bs';

export default function Home() {
    const images = ['./image/숙소사진.png', './image/숙소사진2.png', './image/숙소사진3.png'];

    // 슬라이더 설정
    const settings = {
        dots: true, // 하단 점(페이지네이션) 표시 여부
        infinite: true, // 무한 루프
        speed: 500, // 전환 속도 (ms)
        slidesToShow: 1, // 한 번에 보여줄 슬라이드 수
        slidesToScroll: 1, // 한 번에 스크롤할 슬라이드 수
        autoplay: true, // 자동 재생
        autoplaySpeed: 3000, // 자동 재생 간격 (3초)
    };
    return (
        <div className="container text-center">
            <h1 className="fw-bold">숙소 이름</h1>
            <br />
            <Slider {...settings}>
                {images.map((img, index) => (
                    <div key={index}>
                        <img
                            className="rounded"
                            src={img}
                            alt={`숙소사진${index + 1}`}
                            style={{
                                width: '100%',
                                height: '500px',
                                objectFit: 'cover',
                                objectPosition: 'center',
                            }}
                        />
                    </div>
                ))}
            </Slider>
            <br />
            <hr />
            <div class="btn-group btn-group-lg" style={{ width: '100%', height: '200px' }}>
                <button type="button" class="btn btn-outline-secondary">
                    <BsFillMegaphoneFill size="100" />
                    <br /> <br />
                    숙소 안내
                </button>
                <button type="button" class="btn btn-outline-secondary">
                    <BsBusFront size="100" /> <br /> <br />
                    오시는 길
                </button>
                <button type="button" class="btn btn-outline-secondary">
                    <BsCalendar2Check size="100" />
                    <br /> <br />
                    예약하기
                </button>
            </div>
        </div>
    );
}
