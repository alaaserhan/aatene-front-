"use client";

import { useEffect, useState } from "react";
import { db } from "@/src/lib/firebase";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    DocumentData,
    QuerySnapshot
} from "firebase/firestore";

export interface FirestoreMessage {
    id: string;
    conversationId: string;
    body: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    createdAt: Date;
    files?: string[];
}

export interface FirestoreConversation {
    id: string;
    type: "group" | "direct";
    name: string;
    participants: string[];
    lastMessage: string | null;
    lastMessageAt: Date | null;
    createdAt: Date;
}

export const useRealtimeConversations = () => {
    const [conversations, setConversations] = useState<FirestoreConversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!db) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "conversations"),
            orderBy("lastMessageAt", "desc")
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot: QuerySnapshot<DocumentData>) => {
                const convs: FirestoreConversation[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    convs.push({
                        id: doc.id,
                        type: data.type || "direct",
                        name: data.name || "",
                        participants: data.participants || [],
                        lastMessage: data.lastMessage || null,
                        lastMessageAt: data.lastMessageAt?.toDate() || null,
                        createdAt: data.createdAt?.toDate() || new Date(),
                    });
                });
                setConversations(convs);
                setLoading(false);
            },
            (err) => {
                console.error("Firestore error:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return { conversations, loading, error };
};

export const useRealtimeMessages = (conversationId: string | null) => {
    const [messages, setMessages] = useState<FirestoreMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!db || !conversationId) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "conversations", conversationId, "messages"),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot: QuerySnapshot<DocumentData>) => {
                const msgs: FirestoreMessage[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    msgs.push({
                        id: doc.id,
                        conversationId: conversationId,
                        body: data.body || "",
                        senderId: data.senderId || "",
                        senderName: data.senderName || "",
                        senderAvatar: data.senderAvatar || "",
                        createdAt: data.createdAt?.toDate() || new Date(),
                        files: data.files || [],
                    });
                });
                setMessages(msgs);
                setLoading(false);
            },
            (err) => {
                console.error("Firestore messages error:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [conversationId]);

    return { messages, loading, error };
};
