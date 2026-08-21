"use client";

import {
  ReviewItem,
  ReviewsSection,
  type ReviewSubmitPayload,
  type SharedReview,
} from "@/src/components/(web)/reviews";
import { Container } from "@/src/components/shared/Container";
import { Badge } from "@/src/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { MediaViewer } from "@/src/components/ui/MediaViewer";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { SafeHTML } from "@/src/components/ui/SafeHTML";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { ReportAbuseModal } from "@/src/features/(web)/reports/components/ReportAbuseModal";
import { useAuthStore } from "@/src/stores/auth-store";
import {
  ChevronDown,
  ChevronLeft,
  Flag,
  Loader2,
  Plus,
  PlusSquare,
  Search,
  User,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ReviewStatisticsDisplay } from "../../product/components/ReviewStatisticsDisplay";
import { ReviewStatistics } from "../../product/types"; // Import types
import { Service, ServiceBoardQuestion } from "../api";
import {
  useAddServiceReview,
  useGetServiceBoardAnswers,
  useGetServiceBoardQuestions,
  useGetServiceReviewReplies,
  useGetServiceReviews,
  usePostServiceBoardAnswer,
  usePostServiceBoardQuestion,
} from "../hooks";
import { Button } from "@/src/components/ui/button";

interface ServiceTabsProps {
  service: Service;
}

type TabType = "description" | "specialties" | "reviews" | "qa" | "faq";

export default function ServiceTabs({ service }: ServiceTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("description");

  const hasSpecialties = Boolean(service.specialties?.length);

  const tabs: { id: TabType; label: string }[] = [
    { id: "description", label: "وصف الخدمة" },
    ...(hasSpecialties
      ? [{ id: "specialties" as TabType, label: "تخصصات ومجالات العمل" }]
      : []),
    { id: "reviews", label: "تقييم و مراجعات" },
    { id: "qa", label: "أسئلة وأجوبة" },
    { id: "faq", label: "الأسئلة الشائعة" },
  ];

  // Full-bleed on purpose: the triggers sit on the same tinted band as the hero
  // while the panels sit on the white band, so each half brings its own
  // background and Container.
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as TabType)}
    >
      <div className="bg-c2-neutral-50">
        <Container className="pb-6 lg:pt-9">
          <TabsList className="w-full max-w-full justify-start overflow-x-auto">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="min-w-30">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Container>
      </div>

      <div className="bg-white shadow-md">
        <Container className="pt-8 pb-8 lg:pb-20">
          <TabsContent value="description" className="min-h-75">
            <h3 className="mb-4 text-lg font-bold text-c2-navy-1000">
              وصف الخدمة
            </h3>
            <div className="prose prose-lg max-w-none leading-relaxed text-black text-base font-normal">
              <SafeHTML html={service.description} />
            </div>
          </TabsContent>

          {hasSpecialties && (
            <TabsContent value="specialties" className="min-h-75">
              <ServiceSpecialties service={service} />
            </TabsContent>
          )}

          <TabsContent value="reviews" className="min-h-75">
            <ServiceReviewsSection service={service} />
          </TabsContent>

          <TabsContent value="qa" className="min-h-75">
            <ServiceQASection service={service} />
          </TabsContent>

          <TabsContent value="faq" className="min-h-75">
            <ServiceFAQ service={service} />
          </TabsContent>
        </Container>
      </div>
    </Tabs>
  );
}

function ServiceSpecialties({ service }: { service: Service }) {
  const specialties = service.specialties || [];

  return (
    <div className="space-y-6">
      <h3 className="mb-4 text-lg font-bold text-c2-navy-1000">
        التخصصات ومجالات العمل
      </h3>

      {specialties.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {specialties.map((spec) => (
            <Badge
              key={spec.id}
              variant="primary-outline"
              className="px-4 py-2"
            >
              {spec.title}
            </Badge>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">لا توجد تخصصات</p>
        </div>
      )}
    </div>
  );
}

function ServiceReviewsSection({ service }: { service: Service }) {
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(
    new Set(),
  );
  const [mediaViewerState, setMediaViewerState] = useState<{
    isOpen: boolean;
    media: string[];
    index: number;
  }>({ isOpen: false, media: [], index: 0 });

  const [page, setPage] = useState(1);
  const {
    data,
    isLoading,
    refetch: refetchReviews,
  } = useGetServiceReviews(service.slug, page);
  const { mutate: addReview, isPending } = useAddServiceReview();

  const handleSubmit = (formData: {
    content: string;
    rate: number;
    images: File[];
    parent_id?: number | null;
  }) => {
    return new Promise<void>((resolve, reject) => {
      addReview(
        {
          slug: service.slug,
          payload: {
            content: formData.content,
            rate: String(formData.rate),
            images: formData.images,
            parent_id: formData.parent_id,
          },
        },
        {
          onSuccess: () => {
            if (formData.parent_id) {
              setExpandedReplies((prev) =>
                new Set(prev).add(formData.parent_id!),
              );
            }
            resolve();
          },
          onError: () => reject(),
        },
      );
    });
  };

  const handleToggleReplies = (reviewId: number) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  };

  const openMedia = (media: string[], index: number = 0) => {
    setMediaViewerState({ isOpen: true, media, index });
  };

  const reviews = data?.reviews || [];

  // Calculate statistics
  let statistics: ReviewStatistics | undefined;
  if (data?.rate_stats) {
    statistics = {
      total_reviews: data.total || 0,
      average_rate: Number(data.avg_rate) || 0,
      stars: data.rate_stats,
    };
  } else {
    statistics = {
      total_reviews: Number(service.review_count) || 0,
      average_rate: Number(service.review_rate) || 0,
      stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  return (
    <>
      <ReviewsSection
        stats={statistics && <ReviewStatisticsDisplay stats={statistics} />}
        isLoading={isLoading}
        itemsOnPage={reviews.length}
        total={data?.total}
        page={page}
        setPage={setPage}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      >
        {reviews.map((review) => (
          <ServiceReviewWithReplies
            key={review.id}
            review={review as unknown as SharedReview}
            serviceSlug={service.slug}
            onOpenMedia={openMedia}
            onSubmitReply={handleSubmit}
            isSubmittingReply={isPending}
            showReplies={expandedReplies.has(review.id)}
            onToggleReplies={handleToggleReplies}
            onReviewChanged={refetchReviews}
          />
        ))}
      </ReviewsSection>

      {mediaViewerState.isOpen && (
        <MediaViewer
          isOpen={mediaViewerState.isOpen}
          onClose={() =>
            setMediaViewerState((prev) => ({ ...prev, isOpen: false }))
          }
          media={mediaViewerState.media}
          initialIndex={mediaViewerState.index}
        />
      )}
    </>
  );
}

function ServiceReviewWithReplies({
  review,
  serviceSlug,
  onOpenMedia,
  onSubmitReply,
  isSubmittingReply,
  showReplies,
  onToggleReplies,
  onReviewChanged,
}: {
  review: SharedReview;
  serviceSlug: string;
  onOpenMedia: (media: string[], index: number) => void;
  onSubmitReply: (data: ReviewSubmitPayload) => Promise<void> | void;
  isSubmittingReply: boolean;
  showReplies: boolean;
  onToggleReplies: (id: number) => void;
  onReviewChanged: () => void;
}) {
  const {
    data: repliesData,
    isLoading: isLoadingReplies,
    refetch: refetchReplies,
  } = useGetServiceReviewReplies(serviceSlug, showReplies ? review.id : 0);

  const replies = (repliesData?.reviews || []) as unknown as SharedReview[];

  const handleChanged = () => {
    onReviewChanged();
    if (showReplies) refetchReplies();
  };

  return (
    <ReviewItem
      review={review}
      onOpenMedia={onOpenMedia}
      reportType="comment"
      onSubmitReply={onSubmitReply}
      isSubmittingReply={isSubmittingReply}
      showReplies={showReplies}
      onToggleReplies={onToggleReplies}
      replies={replies}
      isLoadingReplies={isLoadingReplies && showReplies}
      onDeleted={handleChanged}
      onUpdated={handleChanged}
    />
  );
}

function ServiceFAQ({ service }: { service: Service }) {
  const questions = service.questions || [];

  // Fallback if no questions (for demo matching image)
  const demoQuestions = [
    {
      id: 1,
      question: "مـا هـي خدمـة ”محـام إلـى جانبـك“؟",
      answer:
        "هي خدمة تتيح لك الحصول على استشارة قانونية فورية من محام مختص في مختلف المجالات القانونية دون الحاجة لحجز موعد مسبق.",
    },
    {
      id: 2,
      question: "ما نوع القضايا التي يمكنني الاستفسار عنها؟",
      answer:
        "يمكنك طرح استفساراتك في قضايا مثل: الأحوال الشخصية (الطلاق، الحضانة)، العقود, القضايا العمالية، والمشاكل القانونية الطارئة.",
    },
    {
      id: 3,
      question: "هل الاستشارة سرية؟",
      answer:
        "نعم، جميع الاستشارات تتم بسرية تامة واحترافية عالية لضمان خصوصيتك.",
    },
  ];

  const displayQuestions = questions.length > 0 ? questions : demoQuestions;

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-c2-navy-1000">الأسئلة الشائعة</h3>
        <p className="text-[#676D88] font-normal text-sm leading-relaxed">
          شاهد إجابات الأسئلة الشائعة
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {displayQuestions.map((q, index) => (
          <div key={q.id} className="py-4">
            <h5
              className={`font-medium text-sm transition-colors text-c2-navy-1000 `}
            >
              {index + 1}. {q.question}
            </h5>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out  mt-2`}
            >
              <p className="text-[#343C60] leading-relaxed pr-4 border-r-2 border-blue-100 mr-1 text-sm">
                {q.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceQASection({ service }: { service: Service }) {
  const [orderType, setOrderType] = useState<
    "most_recent" | "oldest" | "recently_answered"
  >("most_recent");
  const [search, setSearch] = useState("");
  const [content, setContent] = useState("");
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);

  const [visibleCount, setVisibleCount] = useState(4);

  // We optionally use 'search' in API if backend supports it, for now we will just use useGetServiceBoardQuestions
  const { data, isLoading } = useGetServiceBoardQuestions(service.id, {
    order_type: orderType,
    content: search,
  });
  const { mutate: postQuestion, isPending: isPosting } =
    usePostServiceBoardQuestion();
  const authUser = useAuthStore((state) => state.user);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!content.trim() || isPosting) return;
    postQuestion(
      { serviceId: service.id, content },
      {
        onSuccess: () => {
          setContent("");
          setIsAddQuestionModalOpen(false);
        },
      },
    );
  };

  const sortOptions = [
    { value: "most_recent", label: "الأحدث" },
    { value: "oldest", label: "الأقدم" },
    { value: "recently_answered", label: "تمت الإجابة حديثاً" },
  ];

  const questions = data?.questions || [];
  const visibleQuestions = questions.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-c2-navy-1000">أسئلة وأجوبة</h3>
        <p className="text-[#676D88] font-normal text-sm leading-relaxed">
          جميع الإجابات المنشورة تمثل آراء وتجارب أصحابها فقط، ولا تعتبر
          بالضرورة عن وجهة نظر منصة أعطني. لا تقوم المنصة بمراجعة أو التحقق من
          صحة هذه الإجابات، ولا تُعد مؤيدة لها بأي شكل من الأشكال.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pb-4">
        <div className="flex items-center w-full sm:w-auto gap-4 flex-1">
          <div className="relative w-full sm:max-w-lg border border-c2-primary rounded-full bg-white overflow-hidden flex items-center gap-2 h-12">
            <input
              type="text"
              placeholder="بحث"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-0 outline-none"
            />
            <div className="size-10 bg-blue-3 shrink-0 rounded-full flex items-center justify-center  ml-2">
              <Search className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="w-45 shrink-0">
            <ReusableDropdown
              options={sortOptions}
              value={orderType}
              onChange={(val) =>
                setOrderType(
                  val as "most_recent" | "oldest" | "recently_answered",
                )
              }
              placeholder="ترتيب حسب"
              className="w-full bg-white rounded-full border-gray-300 h-11 min-w-50"
            />
          </div>
        </div>

        <Button
          className="rounded-full has-[>svg]:px-6 py-6 gap-1"
          onClick={() => setIsAddQuestionModalOpen(true)}
        >
          <PlusSquare className="w-5 h-5" />
          أضف سؤال
        </Button>
      </div>

      <div className="space-y-4 mt-6">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-3 w-8 h-8" />
          </div>
        ) : questions.length > 0 ? (
          <>
            {visibleQuestions.map((q) => (
              <ServiceQAItem key={q.id} question={q} />
            ))}

            {visibleCount < questions.length && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 4)}
                  className="flex items-center gap-2 text-blue-4 font-medium hover:text-blue-3 transition-colors cursor-pointer text-sm"
                >
                  <span>عرض المزيد من الأسئلة</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">لا توجد أسئلة بعد، كن أول من يسأل!</p>
          </div>
        )}
      </div>

      <Dialog
        open={isAddQuestionModalOpen}
        onOpenChange={setIsAddQuestionModalOpen}
      >
        <DialogContent
          className="max-w-xl p-0 overflow-hidden bg-white gap-0 border-0"
          dir="rtl"
        >
          <DialogHeader className="p-6 pb-1 relative flex flex-col items-center">
            <DialogTitle className="text-xl md:text-2xl font-medium  w-full">
              إضافة سؤال
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className=" relative bg-white overflow-hidden p-[1px]">
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full border border-gray-100 overflow-hidden shadow-sm bg-gray-100 shrink-0 z-10 flex items-center justify-center">
                {authUser?.avatar_url ? (
                  <Image
                    src={authUser.avatar_url}
                    alt="user"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="اكتب سؤالك هنا"
                className="w-full h-32 resize-none border border-gray-200 rounded-xl focus:outline-none bg-transparent text-sm leading-relaxed p-4 pr-16 pt-5 "
                maxLength={300}
              />
              <div
                className="text-left mb-2 ml-4 text-xs text-gray-2"
                dir="ltr"
              >
                {content.length} / 300
              </div>
            </div>
            <button
              onClick={() => handleSubmit()}
              disabled={isPosting || !content.trim()}
              className="w-full cursor-pointer mt-6 py-3.5 bg-blue-4 text-white rounded-full transition-colors font-medium text-sm flex items-center justify-center disabled:opacity-50 "
            >
              {isPosting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "إضافة السؤال"
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ServiceQAItem({ question }: { question: ServiceBoardQuestion }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isAnswersModalOpen, setIsAnswersModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAnswerReportOpen, setIsAnswerReportOpen] = useState(false);
  const [reportAnswerId, setReportAnswerId] = useState<number | null>(null);

  const displayAnswers = question.answers || [];
  const answersCount = Number(question.answers_count) || displayAnswers.length;
  const firstAnswer = displayAnswers.length > 0 ? displayAnswers[0] : null;

  return (
    <div
      className="bg-white border border-gray-200 p-5 rounded-lg relative"
      dir="rtl"
    >
      <div className="flex justify-between items-start gap-4">
        <h4 className="font-medium text-base md:text-lg flex-1">
          {question.content}
        </h4>
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 text-red-600 font-medium hover:text-red-600 transition-colors cursor-pointer text-xs"
          >
            <Flag className="w-3.5 h-3.5" />
            بلغ عن إساءة
          </button>
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#456A8E] rounded-md text-xs text-[#456A8E] font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Image
              src="/icons/dashboard/chat3.svg"
              alt="message"
              width={14}
              height={14}
              className="w-3.5 h-3.5"
            />
            الاجابة
          </button>
        </div>
      </div>

      {firstAnswer && (
        <div className="p-4 bg-gray-50 mt-4 rounded-lg">
          <p className="text-gray-2 text-sm leading-relaxed mb-4">
            {firstAnswer.content}
          </p>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-gray-100 overflow-hidden shadow-sm bg-gray-100 shrink-0 flex items-center justify-center">
                {firstAnswer.user?.avatar_url ? (
                  <Image
                    src={firstAnswer.user.avatar_url}
                    alt={firstAnswer.user?.name || ""}
                    width={28}
                    height={28}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <span className="text-sm font-medium ">
                {firstAnswer.user?.name}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-gray-400">{firstAnswer.created_at}</span>
              <button
                onClick={() => {
                  setReportAnswerId(firstAnswer.id);
                  setIsAnswerReportOpen(true);
                }}
                className="flex items-center gap-1.5 text-red-600 font-medium hover:text-red-600 transition-colors cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                بلغ عن إساءة
              </button>
            </div>
          </div>
        </div>
      )}

      {showReplyForm && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <ServiceQAAnswerForm
            questionId={question.id}
            onClose={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {answersCount > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setIsAnswersModalOpen(true)}
            className="flex items-center gap-1 text-sm font-medium text-[#456A8E] hover:text-[#355A7E] transition-colors cursor-pointer"
          >
            عرض المزيد من الإجابات ({answersCount})
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      <ServiceQAAnswersModal
        isOpen={isAnswersModalOpen}
        onClose={() => setIsAnswersModalOpen(false)}
        question={question}
        onReportAnswer={(answerId) => {
          setReportAnswerId(answerId);
          setIsAnswerReportOpen(true);
          setIsAnswersModalOpen(false);
        }}
      />

      {isReportModalOpen && (
        <ReportAbuseModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          type="service_board_question"
          id={question.id}
        />
      )}

      {isAnswerReportOpen && reportAnswerId && (
        <ReportAbuseModal
          isOpen={isAnswerReportOpen}
          onClose={() => {
            setIsAnswerReportOpen(false);
            setReportAnswerId(null);
          }}
          type="service_board_answer"
          id={reportAnswerId}
        />
      )}
    </div>
  );
}

function ServiceQAAnswerForm({
  questionId,
  onClose,
}: {
  questionId: number;
  onClose: () => void;
}) {
  const [content, setContent] = useState("");
  const { mutate: postAnswer, isPending } = usePostServiceBoardAnswer();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPending) return;
    postAnswer(
      { questionId, content },
      {
        onSuccess: () => {
          setContent("");
          onClose();
        },
      },
    );
  };

  return (
    <div
      className="border border-gray-200 rounded-lg p-4 relative bg-white"
      dir="rtl"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="أضف إجابتك هنا"
        className="w-full h-24 resize-none focus:outline-none bg-transparent placeholder-gray-400 text-sm leading-relaxed"
        maxLength={300}
      />
      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-gray-400" dir="ltr">
          {content.length} / 300
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-6 py-2 text-[#456A8E] text-sm font-medium hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          >
            إغلاق
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !content.trim()}
            className="px-6 py-2 bg-[#456A8E] text-white text-sm font-medium hover:bg-[#355A7E] rounded-md transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center min-w-[100px]"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "إضافة الإجابة"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceQAAnswersModal({
  isOpen,
  onClose,
  question,
  onReportAnswer,
}: {
  isOpen: boolean;
  onClose: () => void;
  question: ServiceBoardQuestion;
  onReportAnswer: (answerId: number) => void;
}) {
  const { data: answersData, isLoading } = useGetServiceBoardAnswers(
    question.id,
    isOpen,
  );
  const answers = answersData?.answers || question.answers || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-2xl p-0 overflow-hidden bg-white border-0"
        dir="rtl"
      >
        <DialogHeader className="p-6 pb-0 relative flex flex-col items-center shrink-0">
          <DialogTitle className="text-xl font-medium  w-full">
            المزيد من الإجابات{" "}
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 md:p-6 overflow-y-auto max-h-[75vh] space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-3 w-8 h-8" />
            </div>
          ) : answers.length > 0 ? (
            <div className="space-y-4">
              {answers.map((ans) => (
                <div
                  key={ans.id}
                  className="bg-white border border-gray-200 p-4 rounded-lg"
                >
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    {ans.content}
                  </p>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full border border-gray-100 overflow-hidden shadow-sm bg-gray-100 shrink-0 flex items-center justify-center">
                        {ans.user?.avatar_url ? (
                          <Image
                            src={ans.user.avatar_url}
                            alt={ans.user?.name || ""}
                            width={28}
                            height={28}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <span className="text-sm font-medium ">
                        {ans.user?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-400" dir="ltr">
                        {ans.created_at}
                      </span>
                      <button
                        type="button"
                        onClick={() => onReportAnswer(ans.id)}
                        className="flex items-center gap-1.5 text-red-600 font-medium hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        بلغ عن إساءة
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">لا توجد إجابات بعد</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
