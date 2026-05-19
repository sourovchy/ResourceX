// utils/dummyData.ts

import { Conversation, Message } from "@/types/chat";

export const DUMMY_CONVERSATIONS: Conversation[] = [
	{
		id: "c1",
		participant: { id: "u1", name: "Nusrat J.", avatar: "N", online: true },
		itemTitle: "Sony Alpha A7III Camera",
		lastMessage: "Yes, you can pick it up tomorrow morning.",
		lastMessageTime: "10:30 AM",
		unreadCount: 2,
	},
	{
		id: "c2",
		participant: { id: "u2", name: "Tanvir A.", avatar: "T", online: false },
		itemTitle: "DJI Mavic Air 2 Drone",
		lastMessage: "Thanks for renting it! Everything looks great.",
		lastMessageTime: "Yesterday",
		unreadCount: 0,
	},
	{
		id: "c3",
		participant: { id: "u3", name: "Sam I.", avatar: "S", online: true },
		itemTitle: "Calculus Textbook Vol 2",
		lastMessage: "Can we extend the deadline by a day?",
		lastMessageTime: "Tuesday",
		unreadCount: 0,
	},
	{
		id: "c4",
		participant: { id: "u4", name: "Riya M.", avatar: "R", online: false },
		itemTitle: "Mechanical Keyboard",
		lastMessage: "I'll return it by Friday, no worries.",
		lastMessageTime: "Monday",
		unreadCount: 1,
	},
	{
		id: "c5",
		participant: { id: "u5", name: "Farhan K.", avatar: "F", online: true },
		itemTitle: "Physics Lab Manual",
		lastMessage: "Is the item in good condition?",
		lastMessageTime: "Last Week",
		unreadCount: 0,
	},
];

export const DUMMY_MESSAGES: Record<string, Message[]> = {
	c1: [
		{
			id: "m1",
			conversationId: "c1",
			senderId: "me",
			text: "Hi Nusrat, is the camera still available for the weekend?",
			time: "09:00 AM",
			timestamp: 1000,
		},
		{
			id: "m2",
			conversationId: "c1",
			senderId: "u1",
			text: "Hello! Yes it is, just make sure to handle it carefully.",
			time: "09:05 AM",
			timestamp: 1001,
		},
		{
			id: "m3",
			conversationId: "c1",
			senderId: "me",
			text: "Awesome. I'll send a booking request right now.",
			time: "09:06 AM",
			timestamp: 1002,
		},
		{
			id: "m4",
			conversationId: "c1",
			senderId: "u1",
			text: "Got it! Approved. When do you want to pick it up?",
			time: "10:15 AM",
			timestamp: 1003,
		},
		{
			id: "m5",
			conversationId: "c1",
			senderId: "me",
			text: "How about tomorrow around 10 AM near the library?",
			time: "10:20 AM",
			timestamp: 1004,
		},
		{
			id: "m6",
			conversationId: "c1",
			senderId: "u1",
			text: "Yes, you can pick it up tomorrow morning.",
			time: "10:30 AM",
			timestamp: 1005,
		},
	],
	c2: [
		{
			id: "m1",
			conversationId: "c2",
			senderId: "me",
			text: "Hey Tanvir, I just returned the drone. Hope everything is fine.",
			time: "2:00 PM",
			timestamp: 2000,
		},
		{
			id: "m2",
			conversationId: "c2",
			senderId: "u2",
			text: "Thanks for renting it! Everything looks great.",
			time: "2:30 PM",
			timestamp: 2001,
		},
	],
	c3: [
		{
			id: "m1",
			conversationId: "c3",
			senderId: "u3",
			text: "Hi! I borrowed the calculus book last week.",
			time: "11:00 AM",
			timestamp: 3000,
		},
		{
			id: "m2",
			conversationId: "c3",
			senderId: "me",
			text: "Sure, how's the reading going?",
			time: "11:05 AM",
			timestamp: 3001,
		},
		{
			id: "m3",
			conversationId: "c3",
			senderId: "u3",
			text: "Can we extend the deadline by a day?",
			time: "11:15 AM",
			timestamp: 3002,
		},
	],
	c4: [
		{
			id: "m1",
			conversationId: "c4",
			senderId: "u4",
			text: "I'll return it by Friday, no worries.",
			time: "5:00 PM",
			timestamp: 4000,
		},
	],
	c5: [],
};
