'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Mock Data
const INITIAL_REVIEWS = [
  {
    id: 1,
    title: "เจ๊โอว ข้าวต้มเป็ด",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=2729&auto=format&fit=crop",
    creator: "BankPii",
    avatar: "https://i.pravatar.cc/150?img=11",
    desc: "มาม่าต้มยำที่รอคิว 2 ชั่วโมง! คุ้มไหมมาดูกัน หมูกรอบคือที่สุดจริงๆ ไม่พูดเยอะเจ็บคอ 🍜🔥",
    likes: "12.5K",
    location: "บรรทัดทอง"
  },
  {
    id: 2,
    title: "Tichuca Rooftop Bar",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2670&auto=format&fit=crop",
    creator: "BKK Hopper",
    avatar: "https://i.pravatar.cc/150?img=32",
    desc: "รูฟท็อปแมงกะพรุนที่สวยที่สุดในกรุงเทพ วิว 360 องศา ค็อกเทลดี เพลงมันส์ 🍸🌌",
    likes: "8.2K",
    location: "สุขุมวิท"
  },
  {
    id: 3,
    title: "หมูปลาร้า ราชดำเนิน",
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=2535&auto=format&fit=crop",
    creator: "StreetFoodHunter",
    avatar: "https://i.pravatar.cc/150?img=53",
    desc: "หมูปลาร้าในตำนาน กลิ่นหอมไป 3 บ้าน 8 บ้าน น้ำจิ้มปลาร้าคือนัวมากกกก 🍢",
    likes: "25K",
    location: "ราชดำเนิน"
  },
  {
    id: 4,
    title: "Factory Coffee",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2574&auto=format&fit=crop",
    creator: "CafeHopping",
    avatar: "https://i.pravatar.cc/150?img=44",
    desc: "กาแฟระดับแชมป์โลก เมนู Signature คือต้องโดน Barista หล่อบอกต่อด้วย ☕✨",
    likes: "5.4K",
    location: "พญาไท"
  },
  {
    id: 5,
    title: "Sushi Masato",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2670&auto=format&fit=crop",
    creator: "FoodieGuru",
    avatar: "https://i.pravatar.cc/150?img=68",
    desc: "โอมากาเสะที่จองยากที่สุดในไทย! คำละลายในปาก เชฟใจดีมาก 🍣🇯🇵",
    likes: "3.1K",
    location: "สุขุมวิท 31"
  },
  {
    id: 6,
    title: "สุกี้จินดา",
    image: "https://images.unsplash.com/photo-1549248233-255ee8433434?q=80&w=2622&auto=format&fit=crop",
    creator: "SpicyLover",
    avatar: "https://i.pravatar.cc/150?img=9",
    desc: "หมาล่าสายพานที่ฮิตที่สุดในตอนนี้ น้ำซุปกระดูกหมูคือดีย์ เริ่มต้นไม้ละ 5 บาท! 🥘🌶️",
    likes: "42K",
    location: "ห้วยขวาง"
  },
  {
    id: 7,
    title: "Burger King (Secret Menu)",
    image: "https://images.unsplash.com/photo-1586190848861-99c8a3fb7ea5?q=80&w=2670&auto=format&fit=crop",
    creator: "CheatDay",
    avatar: "https://i.pravatar.cc/150?img=12",
    desc: "สั่งยังไงให้ได้ชีส 20 แผ่น!? เมนูลับที่พนักงานยังงง 🍔🧀",
    likes: "15K",
    location: "ทั่วประเทศ"
  },
  {
    id: 8,
    title: "After You",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=2574&auto=format&fit=crop",
    creator: "SweetTooth",
    avatar: "https://i.pravatar.cc/150?img=25",
    desc: "คากิโกริรสชาไทยที่ใครก็สู้ไม่ได้ กินกี่ทีก็ฟิน ละลายในปาก 🍧🧡",
    likes: "9.8K",
    location: "Siam Paragon"
  }
];

export default function Home() {
  const [videoGrid, setVideoGrid] = useState(INITIAL_REVIEWS);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<typeof INITIAL_REVIEWS[0] | null>(null);

  const handleLoadMore = () => {
    setIsLoading(true);
    // Simulate API Call
    setTimeout(() => {
      setVideoGrid(prev => [...prev, ...INITIAL_REVIEWS.map(item => ({ ...item, id: item.id + prev.length }))]);
      setIsLoading(false);
    }, 1000);
  };

  const openModal = (item: typeof INITIAL_REVIEWS[0]) => {
    setSelectedVideo(item);
  };

  const closeModal = () => {
    setSelectedVideo(null);
  };

  // Handle body overflow when modal is open
  useEffect(() => {
    if (selectedVideo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedVideo]);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
              <div className="w-10 h-10 bg-brand-yellow rounded-full flex items-center justify-center text-brand-dark font-bold text-xl shadow-sm">
                <i className="fas fa-utensils"></i>
              </div>
              <span className="text-2xl font-bold tracking-tight">Aroi<span className="text-yellow-500">Tok</span></span>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
              <input type="text" placeholder="ค้นหาร้านเด็ด, เมนูดัง..." className="w-full bg-gray-100 rounded-full py-2.5 px-6 pl-12 focus:outline-none focus:ring-2 focus:ring-brand-yellow transition-all" />
              <i className="fas fa-search absolute left-4 top-3.5 text-gray-400"></i>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <button className="hidden md:block px-5 py-2 rounded-full font-medium hover:bg-gray-100 transition">สำหรับครีเอเตอร์</button>
              <button className="bg-brand-dark text-white px-5 py-2 rounded-full font-medium hover:bg-gray-800 transition shadow-lg shadow-brand-yellow/20">
                เข้าสู่ระบบ
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <input type="text" placeholder="ค้นหาร้านอร่อย..." className="w-full bg-gray-100 rounded-full py-2 px-10 focus:outline-none focus:ring-2 focus:ring-brand-yellow" />
            <i className="fas fa-search absolute left-3.5 top-3 text-gray-400"></i>
          </div>
        </div>
      </nav>

      {/* Categories / Filter Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-[108px] md:top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-3 overflow-x-auto hide-scroll pb-1">
            <button className="flex-shrink-0 px-6 py-2 bg-brand-yellow text-brand-dark rounded-full font-semibold shadow-sm transition hover:scale-105 active:scale-95 whitespace-nowrap">
              🔥 มาแรง
            </button>
            <button className="flex-shrink-0 px-6 py-2 bg-gray-100 text-gray-600 rounded-full font-medium hover:bg-gray-200 transition hover:scale-105 whitespace-nowrap">
              🍜 สตรีทฟู้ด
            </button>
            <button className="flex-shrink-0 px-6 py-2 bg-gray-100 text-gray-600 rounded-full font-medium hover:bg-gray-200 transition hover:scale-105 whitespace-nowrap">
              🍣 ญี่ปุ่น
            </button>
            <button className="flex-shrink-0 px-6 py-2 bg-gray-100 text-gray-600 rounded-full font-medium hover:bg-gray-200 transition hover:scale-105 whitespace-nowrap">
              ☕ คาเฟ่
            </button>
            <button className="flex-shrink-0 px-6 py-2 bg-gray-100 text-gray-600 rounded-full font-medium hover:bg-gray-200 transition hover:scale-105 whitespace-nowrap">
              🌶️ ยำ/ตำ
            </button>
            <button className="flex-shrink-0 px-6 py-2 bg-gray-100 text-gray-600 rounded-full font-medium hover:bg-gray-200 transition hover:scale-105 whitespace-nowrap">
              🍰 ของหวาน
            </button>
            <button className="flex-shrink-0 px-6 py-2 bg-gray-100 text-gray-600 rounded-full font-medium hover:bg-gray-200 transition hover:scale-105 whitespace-nowrap">
              🥬 เพื่อสุขภาพ
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Video Feed Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">ดูแล้วหิว 😋</h1>
            <p className="text-gray-500">รวมรีวิวร้านเด็ดจากครีเอเตอร์ทั่วไทย</p>
          </div>
          <div className="hidden md:flex gap-2 text-gray-400">
            <button className="p-2 hover:text-brand-dark"><i className="fas fa-th-large text-xl"></i></button>
            <button className="p-2 hover:text-brand-dark"><i className="fas fa-list text-xl"></i></button>
          </div>
        </div>

        {/* Masonry Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {videoGrid.map((item) => (
            <div
              key={item.id}
              className="video-card relative group rounded-2xl overflow-hidden shadow-md cursor-pointer aspect-[9/16] bg-gray-200"
              onClick={() => openModal(item)}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              {/* Play Icon (Center) */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                <div className="play-btn w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center ring-1 ring-white">
                  <i className="fas fa-play text-white ml-1"></i>
                </div>
              </div>

              {/* Top Info (Views/Distance) */}
              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs font-medium">
                <i className="fas fa-location-dot text-brand-yellow mr-1"></i> 1.2km
              </div>

              {/* Bottom Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <img src={item.avatar} className="w-6 h-6 rounded-full border border-white" alt="Avatar" />
                  <span className="text-xs font-bold truncate">{item.creator}</span>
                </div>
                <Link href={`/restaurant/${item.id}`} className="hover:text-brand-yellow transition" onClick={(e) => e.stopPropagation()}>
                  <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-2">{item.title}</h3>
                </Link>
                <p className="text-xs text-gray-300 flex items-center gap-1">
                  <i className="fas fa-map-marker-alt text-brand-yellow"></i> {item.location}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs font-medium">
                  <span className="flex items-center gap-1"><i className="fas fa-heart"></i> {item.likes}</span>
                  <span className="flex items-center gap-1"><i className="fas fa-share"></i> Share</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="mt-12 text-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="bg-white border-2 border-gray-200 text-brand-dark px-8 py-3 rounded-full font-bold hover:bg-brand-yellow hover:border-brand-yellow hover:shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>กำลังโหลด... <i className="fas fa-spinner fa-spin ml-2"></i></>
            ) : (
              <>โหลดเพิ่มเติม <i className="fas fa-spinner fa-spin ml-2 hidden"></i></>
            )}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-yellow rounded-full flex items-center justify-center text-brand-dark font-bold text-sm">
              <i className="fas fa-utensils"></i>
            </div>
            <span className="text-xl font-bold">AroiTok</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500 font-medium">
            <a href="#" className="hover:text-brand-dark">เกี่ยวกับเรา</a>
            <a href="#" className="hover:text-brand-dark">สมัครเป็นครีเอเตอร์</a>
            <a href="#" className="hover:text-brand-dark">ติดต่อโฆษณา</a>
            <a href="#" className="hover:text-brand-dark">นโยบายความเป็นส่วนตัว</a>
          </div>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-brand-yellow hover:text-black transition"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-brand-yellow hover:text-black transition"><i className="fab fa-tiktok"></i></a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-brand-yellow hover:text-black transition"><i className="fab fa-instagram"></i></a>
          </div>
        </div>
        <p className="text-center text-gray-400 text-xs mt-8">© 2024 AroiTok. All rights reserved. ไม่ได้มีไว้สั่งอาหาร มีไว้ดูให้หิวเล่นๆ</p>
      </footer>

      {/* Video Modal Overlay */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeModal}>
          <div className="relative w-full max-w-4xl h-[85vh] bg-brand-dark rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl modal-content" onClick={e => e.stopPropagation()}>

            {/* Close Button */}
            <button onClick={closeModal} className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition backdrop-blur-md">
              <i className="fas fa-times"></i>
            </button>

            {/* Video Section (Left/Top) */}
            <div className="w-full md:w-3/5 h-[50%] md:h-full bg-black relative group cursor-pointer">
              {/* Mock Video Player UI */}
              <Image
                src={selectedVideo.image}
                alt={selectedVideo.title}
                fill
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition duration-300 ring-1 ring-white/50">
                  <i className="fas fa-play text-3xl text-white ml-2"></i>
                </div>
              </div>
              {/* Video Progress Bar Mock */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                <div className="h-full w-1/3 bg-brand-yellow"></div>
              </div>
            </div>

            {/* Details Section (Right/Bottom) */}
            <div className="w-full md:w-2/5 h-[50%] md:h-full bg-white flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <img src={selectedVideo.avatar} className="w-10 h-10 rounded-full border border-gray-200" alt="Creator" />
                  <div>
                    <h3 className="font-bold text-sm">{selectedVideo.creator}</h3>
                    <p className="text-xs text-gray-500">ผู้ติดตาม 5.2K</p>
                  </div>
                  <button className="ml-auto bg-brand-dark text-white text-xs px-4 py-1.5 rounded-full font-medium">ติดตาม</button>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-2">{selectedVideo.desc}</p>
                <div className="flex flex-wrap gap-2 text-xs text-blue-600 font-medium">
                  <span>#อร่อยบอกต่อ</span>
                  <span>#สตรีทฟู้ด</span>
                </div>
              </div>

              {/* Engagement Stats */}
              <div className="px-6 py-3 bg-gray-50 flex justify-between text-gray-500 text-sm border-b border-gray-100">
                <span className="flex items-center gap-2"><i className="fas fa-heart text-red-500"></i> 1.2K</span>
                <span className="flex items-center gap-2"><i className="fas fa-comment text-blue-500"></i> 45 คอมเมนต์</span>
                <span className="flex items-center gap-2"><i className="fas fa-share text-green-500"></i> 120 แชร์</span>
              </div>

              {/* Restaurant Info & CTA (Sticks to bottom) */}
              <div className="mt-auto p-6 bg-yellow-50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Link href={`/restaurant/${selectedVideo.id}`} className="hover:underline hover:text-brand-yellow transition">
                      <h4 className="font-bold text-lg text-brand-dark">{selectedVideo.title}</h4>
                    </Link>
                    <div className="flex text-yellow-500 text-xs my-1">
                      <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star-half-alt"></i>
                      <span className="text-gray-500 ml-1">(4.8)</span>
                    </div>
                    <p className="text-xs text-gray-500"><i className="fas fa-map-marker-alt mr-1"></i> {selectedVideo.location}</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <i className="fas fa-store text-2xl text-brand-yellow"></i>
                  </div>
                </div>

                <Link href={`/restaurant/${selectedVideo.id}`} className="w-full bg-brand-dark text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-dark/20 hover:bg-gray-800 transition flex items-center justify-center gap-2">
                  <span>ดูพิกัดร้าน</span>
                  <i className="fas fa-location-arrow text-brand-yellow"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
