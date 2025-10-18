import { Image } from "antd";
import { memo, useEffect, useState } from "react";
import { EyeOutlined, DownloadOutlined, HeartOutlined, PlusOutlined } from "@ant-design/icons";
import CustomFunction from "../../../dependencies/custom_functions/customfunctions";

const galleryItems = [
    {
        id: 1,
        title: "Corporate Meeting",
        description: "Professional planning session at our HQ.",
        src: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80",
        author: "John Doe"
    },
    {
        id: 2,
        title: "Office Workspace",
        description: "Modern open-space office layout for productivity.",
        src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
        author: "Jane Smith"
    },
    {
        id: 3,
        title: "Team Collaboration",
        description: "Our team collaborating during a strategy session.",
        src: "https://images.unsplash.com/photo-1629904853716-f0bc54eea481?auto=format&fit=crop&w=800&q=80",
        author: "Mike Johnson"
    },
    {
        id: 4,
        title: "Product Launch",
        description: "A glimpse of our latest product launch event.",
        src: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=800&q=80",
        author: "Sarah Williams"
    },
    {
        id: 5,
        title: "Networking Event",
        description: "Engaging with clients and partners.",
        src: "https://images.unsplash.com/photo-1581090700227-1e8a68b7c850?auto=format&fit=crop&w=800&q=80",
        author: "David Brown"
    },
    {
        id: 6,
        title: "Company Culture",
        description: "A snapshot of our work-life culture.",
        src: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
        author: "Emily Davis"
    },
    {
        id: 7,
        title: "Creative Brainstorming",
        description: "Team ideation in progress.",
        src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
        author: "Chris Wilson"
    },
    {
        id: 8,
        title: "Customer Interaction",
        description: "Providing support and building trust.",
        src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
        author: "Lisa Anderson"
    },
    {
        id: 9,
        title: "Digital Presentation",
        description: "Presenting a new concept to stakeholders.",
        src: "https://images.unsplash.com/photo-1612832020628-77f1bb4e88b5?auto=format&fit=crop&w=800&q=80",
        author: "Tom Martinez"
    },
    {
        id: 10,
        title: "Work Anniversary Celebration",
        description: "Celebrating team milestones together.",
        src: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80",
        author: "Amy Garcia"
    },
];

const MediaFiles = ({ campaignId = "" }) => {
    const [liked, setLiked] = useState({});
    const [images, setImages] = useState([]);

    const handleDownload = (src, title) => {
        const link = document.createElement('a');
        link.href = src;
        link.download = title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleLike = (id) => {
        setLiked(prev => ({ ...prev, [id]: !prev[id] }));
    };

    async function trigerDataFetch() {
        const res = await CustomFunction.getData({ campaign_id: campaignId }, 'campaign_media')
        // setTimeline(res)
        setImages(res)
    }

    useEffect(() => {
        if (!campaignId) return

        trigerDataFetch()

    }, [campaignId])

    return (
        <section className="py-8 bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-4xl font-bold mb-2 text-gray-900">Media Gallery</h2>
                <p className="text-gray-600 mb-10">Beautiful free images & pictures</p>

                <Image.PreviewGroup>
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
                        {images?.map((item) => (
                            <div
                                key={item?.id}
                                className="break-inside-avoid group relative overflow-hidden mb-6 bg-gray-100"
                            >
                                {/* Image Container */}
                                <div className="relative cursor-zoom-in">
                                    <Image
                                        src={item?.url}
                                        alt={item?.caption}
                                        loading="lazy"
                                        className="w-full h-auto block transition-transform duration-300 group-hover:scale-105"
                                        preview={{
                                            mask: <span className="invisible">Preview</span>
                                        }}
                                    />

                                    {/* Subtle gradient overlay always visible */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/20 pointer-events-none" />

                                    {/* Hover overlay with actions */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300">
                                        {/* Top right actions */}
                                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button
                                                className={`p-2 rounded backdrop-blur-sm transition-all ${liked[item?.id]
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-white/90 text-gray-700 hover:bg-white'
                                                    }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleLike(item?.id);
                                                }}
                                            >
                                                <HeartOutlined className={liked[item?.id] ? 'text-white' : ''} />
                                            </button>
                                            <button
                                                className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded backdrop-blur-sm transition-all"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                            >
                                                <PlusOutlined />
                                            </button>
                                        </div>

                                        {/* Bottom action bar */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-semibold">
                                                            {item?.uploaded_by.charAt(0)}
                                                        </div>
                                                        <span className="text-white text-sm font-medium drop-shadow-lg">
                                                            {item?.uploaded_by}
                                                        </span>

                                                    </div>
                                                    <div>
                                                        <p className="text-white">{item?.title || ""}</p>
                                                    </div>
                                                </div>

                                                <button
                                                    className="bg-white/90 hover:bg-white text-gray-700 px-4 py-2 rounded text-sm font-medium transition-all flex items-center gap-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDownload(item.url, item.caption);
                                                    }}
                                                >
                                                    <DownloadOutlined />
                                                    Download
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Image.PreviewGroup>
            </div>
        </section>
    );
};

export default memo(MediaFiles);