"use client";

import React, {useState} from "react";
import Link from "next/link";
import ItemCard from "@/components/cards/ItemCard";
import {
    Search,
    Filter,
    Star,
    Clock,
    MapPin,
    ChevronRight,
    CheckCircle2,
    Shield,
} from "lucide-react";

const MOCK_ITEMS = [
    {
        id: "item-1",
        title: "Sony Alpha A7III DSLR Camera",
        category: "Electronics",
        condition: "Excellent",
        pricePerDay: 500,
        deposit: 5000,
        rating: 4.8,
        reviews: 14,
        owner: "Arif H.",
        trustScore: 105,
        isVerified: true,
        image:
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400&h=300",
    },
    {
        id: "item-2",
        title: "Arduino Mega 2560 Kit",
        category: "Academic",
        condition: "Good",
        pricePerDay: 50,
        deposit: 500,
        rating: 4.9,
        reviews: 32,
        owner: "Nusrat J.",
        trustScore: 98,
        isVerified: true,
        image:
            "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=400&h=300",
    },
    {
        id: "item-3",
        title: "JBL PartyBox 310",
        category: "Events",
        condition: "Like New",
        pricePerDay: 800,
        deposit: 3000,
        rating: 5.0,
        reviews: 8,
        owner: "Tanvir A.",
        trustScore: 110,
        isVerified: true,
        image:
            "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=400&h=300",
    },
    {
        id: "item-4",
        title: "Calculus Textbook Vol 2",
        category: "Academic",
        condition: "Fair",
        pricePerDay: 10,
        deposit: 100,
        rating: 4.5,
        reviews: 4,
        owner: "Sam I.",
        trustScore: 85,
        isVerified: false,
        image:
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400&h=300",
    },
    {
        id: "item-5",
        title: "Acoustic Guitar Yamaha F310",
        category: "Music",
        condition: "Good",
        pricePerDay: 150,
        deposit: 1500,
        rating: 4.7,
        reviews: 12,
        owner: "Rafiq M.",
        trustScore: 95,
        isVerified: true,
        image:
            "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?auto=format&fit=crop&q=80&w=400&h=300",
    },
    {
        id: "item-6",
        title: "Camping Tent (4 Person)",
        category: "Outdoors",
        condition: "Good",
        pricePerDay: 200,
        deposit: 1000,
        rating: 4.6,
        reviews: 5,
        owner: "Hasib K.",
        trustScore: 92,
        isVerified: true,
        image:
            "https://images.unsplash.com/photo-1504280502846-5f562ed22501?auto=format&fit=crop&q=80&w=400&h=300",
    },
];

const CATEGORIES = [
    "All",
    "Electronics",
    "Academic",
    "Events",
    "Music",
    "Outdoors",
];

export default function BorrowPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredItems = MOCK_ITEMS.filter((item) => {
        if (activeCategory !== "All" && item.category !== activeCategory)
            return false;
        if (
            searchQuery &&
            !item.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
            return false;
        return true;
    });

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div
                className="bg-surface border border-borderLight rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-textPrimary tracking-tight">
                        Browse Items to Rent
                    </h1>
                    <p className="text-sm text-textSecondary mt-1">
                        Find the gear you need, from trusted students on campus.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="w-4 h-4 text-textTertiary absolute left-3 top-1/2 -translate-y-1/2"/>
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-surfaceVariant border border-borderLight rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-textPrimary"
                        />
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            activeCategory === cat
                                ? "bg-primary text-white"
                                : "bg-surface border border-borderLight text-textSecondary"
                        }`}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                    <ItemCard key={item.id} item={item}/>
                ))}
            </div>
        </div>
    );
}

// Re-usable components below (temporary - these should be moved to shared if used elsewhere)
interface MOCK_ITEMSType {
	id: string;
	title: string;
	category: string;
	condition: string;
	rating: number;
	reviews: number;
	pricePerDay: number;
	deposit: number;
	owner: string;
	trustScore: number;
	image: string;
}

