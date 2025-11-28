'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Mock Review Data
const REVIEW_DATA = [
    { id: 1, type: 'video', src: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2680', creator: 'BankPii', views: '12K', likes: 850 },
    { id: 2, type: 'photo', src: 'https://images.unsplash.com/photo-1626804475297-411dbe63625f?q=80&w=2574', creator: 'EatWithMe', views: null, likes: 240 },
    { id: 3, type: 'video', src: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?q=80&w=2670', creator: 'MawKom', views: '45K', likes: 1200 },
    { id: 4, type: 'video', src: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?q=80&w=2628', creator: 'PaPaiKin', views: '8.2K', likes: 300 },
    { id: 5, type: 'photo', src: 'https://images.unsplash.com/photo-1618213837778-95779c693a78?q=80&w=2574', creator: 'FoodStagram', views: null, likes: 156 },
    { id: 6, type: 'video', src: 'https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=2600', creator: 'HungryBear', views: '2.1M', likes: 54000 },
    { id: 7, type: 'photo', src: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=2574', creator: 'AliceInFood', views: null, likes: 98 },
    { id: 8, type: 'video', src: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2581', creator: 'ChefTable', views: '102K', likes: 4500 },
    { id: 9, type: 'photo', src: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=2510', creator: 'WongnaiUser', views: null, likes: 45 },
    { id: 10, type: 'video', src: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=2549', creator: 'KinRaiDee', views: '5.6K', likes: 210 }
];

export default function RestaurantDetail({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const { id } = use(params);

    const [activeFilter, setActiveFilter] = useState('all');
    const [isScrolled, setIsScrolled] = useState(false);
    const [filteredReviews, setFilteredReviews] = useState(REVIEW_DATA);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 150) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleFilter = (type: string) => {
        if (type === activeFilter) return;

        setIsAnimating(true);
        setActiveFilter(type);

        setTimeout(() => {
            const newData = type === 'all'
                ? REVIEW_DATA
                : REVIEW_DATA.filter(item => item.type === type || (type === 'star' && item.likes > 1000));

            setFilteredReviews(newData);
            setIsAnimating(false);
        }, 200);
    };

    return (
        <div className="bg-white min-h-screen text-brand-dark font-sans antialiased pb-20">
            {/* Navbar (Sticky with Back Button) */}
            <nav className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
                <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
                        <i className="fas fa-arrow-left text-xl"></i>
                    </Link>
                    <div className={`font-bold text-lg truncate transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}>
                        เจ๊โอว ข้าวต้มเป็ด
                    </div>
                    <div className="flex gap-2">
                        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-600">
                            <i className="fas fa-share-alt"></i>
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-red-500">
                            <i className="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Container */}
            <main className="max-w-2xl mx-auto">

                {/* Shop Header Section */}
                <div className="px-4 pt-2 pb-6">
                    {/* Cover Slider (Mock) */}
                    <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-4 shadow-sm">
                        <Image
                            src="https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=2729&auto=format&fit=crop"
                            alt="Cover"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                            <i className="fas fa-camera"></i> 1,240 รูป
                        </div>
                    </div>

                    {/* Shop Info */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">เจ๊โอว ข้าวต้มเป็ด</h1>
                            <div className="flex items-center gap-2 text-sm mb-2">
                                <span className="flex items-center text-brand-yellow font-bold">
                                    <i className="fas fa-star mr-1"></i> 4.8
                                </span>
                                <span className="text-gray-400">|</span>
                                <span className="text-gray-600">฿฿-฿฿฿</span>
                                <span className="text-gray-400">|</span>
                                <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-md">เปิดอยู่</span>
                            </div>
                        </div>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Michelin_Bib_Gourmand.svg/1200px-Michelin_Bib_Gourmand.svg.png" className="h-10 w-auto" alt="Michelin" />
                    </div>

                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        ร้านข้าวต้มรอบดึกในตำนาน ย่านบรรทัดทอง ทีเด็ดคือมาม่าโอ้โหที่เครื่องแน่นล้นหม้อ หมูกรอบคือที่สุด กรอบนอกนุ่มใน ต้องจองคิว!
                    </p>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-4 gap-3 mb-6">
                        <button className="flex flex-col items-center gap-1 group">
                            <div className="w-12 h-12 rounded-full bg-brand-yellow/10 text-brand-yellow flex items-center justify-center text-xl group-hover:bg-brand-yellow group-hover:text-black transition">
                                <i className="fas fa-location-arrow"></i>
                            </div>
                            <span className="text-xs font-medium text-gray-600">นำทาง</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 group">
                            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xl group-hover:bg-green-500 group-hover:text-white transition">
                                <i className="fas fa-phone"></i>
                            </div>
                            <span className="text-xs font-medium text-gray-600">โทร</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 group">
                            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xl group-hover:bg-blue-500 group-hover:text-white transition">
                                <i className="fab fa-facebook-messenger"></i>
                            </div>
                            <span className="text-xs font-medium text-gray-600">แชท</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 group">
                            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xl group-hover:bg-brand-dark group-hover:text-white transition">
                                <i className="fas fa-utensils"></i>
                            </div>
                            <span className="text-xs font-medium text-gray-600">เมนู</span>
                        </button>
                    </div>

                    <hr className="border-gray-100" />
                </div>

                {/* Sticky Filter Bar */}
                <div className="sticky top-14 bg-white z-40 px-4 pb-2 border-b border-gray-100 shadow-sm">
                    <h2 className="font-bold text-lg mb-3">รีวิวจากลูกค้า <span className="text-gray-400 text-sm font-normal">(854)</span></h2>
                    <div className="flex gap-3 overflow-x-auto hide-scroll pb-2">
                        <button
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${activeFilter === 'all' ? 'bg-brand-dark text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            onClick={() => handleFilter('all')}
                        >
                            ทั้งหมด
                        </button>
                        <button
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition flex items-center gap-2 ${activeFilter === 'video' ? 'bg-brand-dark text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            onClick={() => handleFilter('video')}
                        >
                            <i className="fas fa-video"></i> คลิปวิดีโอ
                        </button>
                        <button
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition flex items-center gap-2 ${activeFilter === 'photo' ? 'bg-brand-dark text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            onClick={() => handleFilter('photo')}
                        >
                            <i className="fas fa-image"></i> รูปภาพ
                        </button>
                        <button
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition flex items-center gap-2 ${activeFilter === 'star' ? 'bg-brand-dark text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            onClick={() => handleFilter('star')}
                        >
                            <i className="fas fa-star text-yellow-400"></i> รีวิวแนะนำ
                        </button>
                    </div>
                </div>

                {/* Content Grid */}
                <div className={`p-4 grid grid-cols-2 md:grid-cols-3 gap-3 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                    {filteredReviews.map((item) => (
                        <div
                            key={item.id}
                            className={`relative group rounded-xl overflow-hidden cursor-pointer bg-gray-100 shadow-sm ${item.type === 'video' ? 'aspect-[9/16]' : 'aspect-square'}`}
                        >
                            <Image
                                src={item.src}
                                alt=""
                                fill
                                className="object-cover transition duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60"></div>

                            {item.type === 'video' ? (
                                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <i className="fas fa-play"></i> {item.views}
                                </div>
                            ) : (
                                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
                                    <i className="fas fa-camera"></i>
                                </div>
                            )}

                            <div className="absolute bottom-2 left-2 right-2 text-white">
                                <div className="flex items-center gap-1 text-xs mb-1 opacity-90">
                                    <i className="far fa-user-circle"></i> {item.creator}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-gray-300">
                                    <i className="fas fa-heart text-brand-yellow"></i> {item.likes}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Loading State */}
                <div className="text-center py-6 text-gray-400 text-sm">
                    <i className="fas fa-circle-notch fa-spin mr-2"></i> กำลังโหลดรีวิวเพิ่มเติม...
                </div>

            </main>

            {/* Floating Action Button (Write Review) */}
            <div className="fixed bottom-6 right-6 md:right-[calc(50%-320px)] z-50 group">
                <button className="bg-brand-yellow text-brand-dark w-14 h-14 rounded-full shadow-xl shadow-yellow-400/40 flex items-center justify-center text-2xl hover:scale-110 transition active:scale-95 border-2 border-white ring-2 ring-brand-yellow">
                    <i className="fas fa-plus"></i>
                </button>
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-brand-dark text-white text-xs py-1 px-3 rounded-lg opacity-0 transition group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                    รีวิวเลย
                </span>
            </div>
        </div>
    );
}
