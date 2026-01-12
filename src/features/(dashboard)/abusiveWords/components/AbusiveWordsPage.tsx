// src/features/(dashboard)/abusiveWords/components/AbusiveWordsPage.tsx
"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Trash2, Eye, AlertTriangle, Ban, Users, MessageSquareWarning, Bell } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { SidebarFilterPanel } from "@/src/components/(dashboard)/SidebarFilterPanel";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Pagination } from "@/src/components/ui/Pagination";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog";
import {
    useGetAbusiveComments,
    useDeleteAbusiveComment,
    useSendAlertToUser,
    useBlockUserAccount,
    useGetAbusiveWords,
    useGetAbusiveWordsCounters,
    useCreateAbusiveWord,
    useDeleteAbusiveWord,
} from "../hooks";
import { AbusiveComment } from "../api";
import { OptionTag } from "@/src/components/ui/OptionTag";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";

const SIDEBAR_TABS = [
    { name: "المستخدمين المسيئين", value: "abusive-users" },
    { name: "عرض جميع الكلمات المضافة", value: "all-words" },
];

type ActionType = "delete-comment" | "block-user" | "send-alert" | "delete-word" | null;

interface PendingAction {
    type: ActionType;
    id: number;
    title: string;
    description: string;
}

export function AbusiveWordsPage() {
    const [activeTab, setActiveTab] = useState("abusive-users");
    const [searchQuery, setSearchQuery] = useState("");
    const [wordsSearchQuery, setWordsSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [wordsCurrentPage, setWordsCurrentPage] = useState(1);
    const [selectedComment, setSelectedComment] = useState<AbusiveComment | null>(null);
    const [newWord, setNewWord] = useState("");
    const perPage = 10;

    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState({ title: "", message: "" });

    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("per_page", String(perPage));
        if (searchQuery) {
            params.set("search", searchQuery);
        }
        return params;
    }, [currentPage, searchQuery]);

    const wordsQueryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", String(wordsCurrentPage));
        params.set("per_page", "50");
        if (wordsSearchQuery) {
            params.set("word", wordsSearchQuery);
        }
        return params;
    }, [wordsCurrentPage, wordsSearchQuery]);

    const { data: commentsData, isLoading } = useGetAbusiveComments(queryParams);
    const { data: wordsData, isLoading: isWordsLoading } = useGetAbusiveWords(wordsQueryParams);
    const { data: countersData } = useGetAbusiveWordsCounters();
    const deleteComment = useDeleteAbusiveComment();
    const sendAlert = useSendAlertToUser();
    const blockUser = useBlockUserAccount();
    const createWord = useCreateAbusiveWord();
    const deleteWord = useDeleteAbusiveWord();

    const comments = commentsData?.comments || [];
    const totalRecords = commentsData?.recordsFiltered || 0;
    const totalPages = Math.ceil(totalRecords / perPage);

    const words = wordsData?.words || [];
    const wordsTotalRecords = wordsData?.recordsFiltered || 0;
    const wordsTotalPages = Math.ceil(wordsTotalRecords / 50);

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const handleWordsSearch = (value: string) => {
        setWordsSearchQuery(value);
        setWordsCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleWordsPageChange = (page: number) => {
        setWordsCurrentPage(page);
    };

    const showConfirmation = (action: PendingAction) => {
        setPendingAction(action);
    };

    const handleConfirmAction = () => {
        if (!pendingAction) return;

        const onSuccess = () => {
            let title = "";
            let message = "";
            switch (pendingAction.type) {
                case "delete-comment":
                    title = "تم حذف التعليق";
                    message = "تم حذف التعليق المسيء بنجاح";
                    break;
                case "block-user":
                    title = "تم حظر المستخدم";
                    message = "تم حظر المستخدم بنجاح";
                    break;
                case "send-alert":
                    title = "تم إرسال التنبيه";
                    message = "تم إرسال التنبيه للمستخدم بنجاح";
                    break;
                case "delete-word":
                    title = "تم حذف الكلمة";
                    message = "تم حذف الكلمة المسيئة بنجاح";
                    break;
            }
            setSuccessMessage({ title, message });
            setShowSuccessModal(true);
        };

        switch (pendingAction.type) {
            case "delete-comment":
                deleteComment.mutate(pendingAction.id, { onSuccess });
                break;
            case "block-user":
                blockUser.mutate(pendingAction.id, { onSuccess });
                break;
            case "send-alert":
                sendAlert.mutate(pendingAction.id, { onSuccess });
                break;
            case "delete-word":
                deleteWord.mutate(pendingAction.id, { onSuccess });
                break;
        }
        setPendingAction(null);
    };

    const handleDeleteComment = (commentId: number) => {
        showConfirmation({
            type: "delete-comment",
            id: commentId,
            title: "هل أنت متأكد من حذف التعليق؟",
            description: "لا يمكن استرجاع التعليق بعد حذفه",
        });
    };

    const handleSendAlert = (commentId: number) => {
        showConfirmation({
            type: "send-alert",
            id: commentId,
            title: "هل أنت متأكد من إرسال تنبيه؟",
            description: "سيتم إرسال تنبيه للمستخدم بخصوص التعليق المسيء",
        });
    };

    const handleBlockUser = (commentId: number) => {
        showConfirmation({
            type: "block-user",
            id: commentId,
            title: "هل أنت متأكد من حظر المستخدم؟",
            description: "سيتم حظر المستخدم من استخدام المنصة",
        });
    };

    const handleViewComment = (comment: AbusiveComment) => {
        setSelectedComment(comment);
    };

    const handleAddWord = () => {
        if (newWord.trim()) {
            createWord.mutate({ word: newWord.trim(), is_active: true }, {
                onSuccess: () => {
                    setSuccessMessage({ title: "تمت الإضافة بنجاح", message: "تمت إضافة الكلمة المسيئة بنجاح" });
                    setShowSuccessModal(true);
                    setNewWord("");
                }
            });
        }
    };

    const handleDeleteWord = (wordId: number) => {
        showConfirmation({
            type: "delete-word",
            id: wordId,
            title: "هل أنت متأكد من حذف الكلمة؟",
            description: "لا يمكن استرجاع الكلمة بعد حذفها",
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).replace(/\//g, "-");
    };

    return (
        <div className="min-h-[calc(100vh-80px)]">
            <div className="container mx-auto py-6 px-4">
                <div className="flex items-start justify-between my-6">
                    <div>
                        <h1 className="text-2xl font-bold">إدارة الكلمات المسيئة</h1>
                        <p className="text-gray-2 text-sm mt-1">
                            أضف الكلمات التي تريد مراقبتها في النظام
                        </p>
                    </div>
                    {activeTab === "abusive-users" && (
                        <Button onClick={()=> setActiveTab("abusive-words")} className="flex items-center gap-2 bg-blue-3 text-white hover:bg-blue-4">
                            <Plus className="w-5 h-5" />
                            إضافة كلمة مسيئة
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 lg:col-span-3">
                        <SidebarFilterPanel
                            options={SIDEBAR_TABS}
                            activeValue={activeTab}
                            onValueChange={setActiveTab}
                            className="h-fit"
                        />
                    </div>
                    <div className="col-span-12 lg:col-span-9">
                        {activeTab === "abusive-users" ? (
                            <div className="bg-white rounded-lg border border-gray-200">
                                <div className="p-4 border-b border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 relative">
                                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <Input
                                                type="text"
                                                placeholder="ابحث عن أي كلمة أو أي مستخدم..."
                                                value={searchQuery}
                                                onChange={(e) => handleSearch(e.target.value)}
                                                className="w-full pr-10 h-11 border-gray-200"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-600">
                                            <tr>
                                                <th className="p-4 text-start font-medium">رقم الحساب</th>
                                                <th className="p-4 text-start font-medium">اسم الحساب</th>
                                                <th className="p-4 text-start font-medium">تاريخ النشر</th>
                                                <th className="p-4 text-center font-medium">عدد الكلمات المسيئة</th>
                                                <th className="p-4 text-start font-medium">عمليات</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                                        جاري التحميل...
                                                    </td>
                                                </tr>
                                            ) : comments.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                                        لا توجد بيانات
                                                    </td>
                                                </tr>
                                            ) : (
                                                comments.map((comment) => (
                                                    <tr key={comment.id} className="hover:bg-gray-50">
                                                        <td className="p-4 text-blue-3 font-medium">
                                                            #{comment.user.id}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="w-10 h-10">
                                                                    <AvatarImage src={comment.user.avatar_url} />
                                                                    <AvatarFallback className="bg-blue-100 text-blue-4">
                                                                        {comment.user.first_name?.[0]}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="font-medium ">
                                                                    {comment.user.first_name} {comment.user.last_name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-gray-600">
                                                            {formatDate(comment.created_at)}
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <span className="inline-flex items-center gap-1 px-3 py-2 bg-red-2 rounded-sm text-xs font-medium">
                                                                {comment.abusive_words_count} كلمات
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => handleViewComment(comment)}
                                                                    className="p-2 bg-[#E5FBFF] rounded-xs cursor-pointer transition-colors"
                                                                    title="عرض التفاصيل"
                                                                >
                                                                    <Eye className="w-4 h-4 text-[#1298B2]" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleBlockUser(comment.id)}
                                                                    className="p-2 bg-red-2 rounded-xs cursor-pointer transition-colors"
                                                                    title="حظر المستخدم"
                                                                >
                                                                    <Ban className="w-4 h-4 text-red-1" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSendAlert(comment.id)}
                                                                    className="p-2 bg-[#FFB90047] rounded-xs cursor-pointer transition-colors"
                                                                    title="إرسال تنبيه"
                                                                >
                                                                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteComment(comment.id)}
                                                                    className="p-2 bg-[#E6E6E6] rounded-xs cursor-pointer transition-colors"
                                                                    title="حذف"
                                                                >
                                                                    <Trash2 className="w-4 h-4 text-gray-500" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {totalPages > 1 && (
                                    <div className="p-4 border-t border-gray-100 flex justify-center">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={handlePageChange}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-lg p-6">
                                        <h3 className="text-lg font-bold text-blue-3 mb-2">إضافة كلمات مسيئة</h3>
                                        <p className="text-gray-2 text-sm mb-4">أضف الكلمات التي تريد مراقبتها في النظام</p>
                                        <div className="flex flex-row items-end gap-2">
                                            <div className="flex-1">
                                                <label className="text-sm text-gray-600 block mb-1">ادخل الكلمة المسيئة</label>
                                                <Input
                                                    type="text"
                                                    placeholder="الكلمة"
                                                    value={newWord}
                                                    onChange={(e) => setNewWord(e.target.value)}
                                                    className="w-full h-10 border-gray-200"
                                                    onKeyDown={(e) => e.key === "Enter" && handleAddWord()}
                                                />
                                            </div>
                                            <Button
                                                onClick={handleAddWord}
                                                disabled={!newWord.trim() || createWord.isPending}
                                                className="flex items-center gap-2 h-10 bg-blue-3 rounded-sm text-white hover:bg-blue-4"
                                            >
                                                <Plus className="w-4 h-4" />
                                                اضافة
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-white rounded-lg p-4 text-center flex flex-col items-center justify-center">
                                            <div className="w-14 h-14 mb-2 bg-blue-50 rounded-full flex items-center justify-center">
                                                <Users className="w-7 h-7 text-blue-3" />
                                            </div>
                                            <p className="text-xs font-medium text-gray-2 mb-1">عدد المستخدمين المسيئين</p>
                                            <p className="text-xl font-bold text-blue-3">{countersData?.unique_users_count || 0}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-4 text-center flex flex-col items-center justify-center">
                                            <div className="w-14 h-14 mb-2 bg-red-50 rounded-full flex items-center justify-center">
                                                <MessageSquareWarning className="w-7 h-7 text-red-500" />
                                            </div>
                                            <p className="text-xs font-medium text-gray-2 mb-1">عدد الكلمات المسيئة</p>
                                            <p className="text-xl font-bold text-red-500">{countersData?.total_words || 0}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-4 text-center flex flex-col items-center justify-center">
                                            <div className="w-14 h-14 mb-2 bg-yellow-50 rounded-full flex items-center justify-center">
                                                <Bell className="w-7 h-7 text-yellow-500" />
                                            </div>
                                            <p className="text-xs font-medium text-gray-2 mb-1">عدد التنبيهات</p>
                                            <p className="text-xl font-bold text-yellow-500">{countersData?.alerts_sent || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg border border-gray-200">
                                    <div className="p-4 border-b border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <Button variant="outline" className="px-6 shrink-0">
                                                بحث
                                            </Button>
                                            <div className="flex-1 relative">
                                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <Input
                                                    type="text"
                                                    placeholder="ابحث عن أي كلمة ..."
                                                    value={wordsSearchQuery}
                                                    onChange={(e) => handleWordsSearch(e.target.value)}
                                                    className="w-full pr-10 h-11 border-gray-200"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-lg font-bold text-blue-3 mb-6 text-center">عرض جميع الكلمات المضافة</h3>
                                        {isWordsLoading ? (
                                            <div className="text-center text-gray-500 py-8">جاري التحميل...</div>
                                        ) : words.length === 0 ? (
                                            <div className="text-center text-gray-500 py-8">لا توجد كلمات مضافة</div>
                                        ) : (
                                            <div className="flex flex-wrap gap-3 justify-center">
                                                {words.map((word) => (
                                                    <OptionTag
                                                        key={word.id}
                                                        label={word.word}
                                                        onRemove={() => handleDeleteWord(word.id)}
                                                        showRemoveButton={true}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {wordsTotalPages > 1 && (
                                        <div className="p-4 border-t border-gray-100 flex justify-center">
                                            <Pagination
                                                currentPage={wordsCurrentPage}
                                                totalPages={wordsTotalPages}
                                                onPageChange={handleWordsPageChange}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={!!selectedComment} onOpenChange={() => setSelectedComment(null)}>
                <DialogContent className="sm:max-w-lg" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-right">تفاصيل التعليق</DialogTitle>
                    </DialogHeader>
                    {selectedComment && (
                        <div className="space-y-4 text-right">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">محتوى التعليق</h4>
                                <p className=" bg-gray-50 p-3 rounded-lg">
                                    {selectedComment.content}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">الكلمات المسيئة</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedComment.abusive_words.map((word) => (
                                        <span
                                            key={word.id}
                                            className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm"
                                        >
                                            {word.word}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">تاريخ النشر</h4>
                                <p className="">
                                    {formatDate(selectedComment.created_at)}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDeleteModal
                isOpen={!!pendingAction}
                onClose={() => setPendingAction(null)}
                onConfirm={handleConfirmAction}
                title={pendingAction?.title || ""}
                description={pendingAction?.description || ""}
                confirmText="نعم، تأكيد"
                cancelText="إلغاء"
            />

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title={successMessage.title}
                message={successMessage.message}
            />
        </div>
    );
}
