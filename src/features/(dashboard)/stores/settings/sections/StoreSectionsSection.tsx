// src/features/(dashboard)/stores/settings/sections/StoreSectionsSection.tsx
"use client";

import { ReactNode, useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Search, Store, Trash2 } from "lucide-react";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Pagination } from "@/src/components/ui/Pagination";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import {
  Section,
  SectionCreatePayload,
} from "@/src/features/(dashboard)/sections/api";
import {
  SectionFormData,
  SectionModal,
} from "@/src/features/(dashboard)/sections/components/SectionModal";
import {
  useCreateSection,
  useDeleteSection,
  useGetSections,
  useUpdateSection,
} from "@/src/features/(dashboard)/sections/hooks";
import { SettingsSection } from "./SettingsSection";

const ITEMS_PER_PAGE = 5;

type SectionStatus = SectionCreatePayload["status"];
type ModalMode = "add" | "edit";

const toStatus = (isActive: boolean): SectionStatus =>
  isActive ? "active" : "not-active";

const isActive = (section: Section) => section.status === "active";

interface StoreSectionsSectionProps {
  storeId: number;
}

/**
 * Sections of the store, managed inline in the settings accordion. Unlike the
 * other panels every action here saves immediately, so there is no save footer.
 */
export function StoreSectionsSection({ storeId }: StoreSectionsSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("add");
  const [selectedSection, setSelectedSection] = useState<SectionFormData | null>(
    null
  );
  const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("per_page", String(ITEMS_PER_PAGE));
    params.set("store_id", String(storeId));
    if (searchQuery) params.set("name", searchQuery);
    return params;
  }, [currentPage, searchQuery, storeId]);

  const {
    data: sectionsData,
    isLoading,
    isError,
  } = useGetSections(queryParams, storeId);

  const { mutate: createSection } = useCreateSection();
  const { mutate: updateSection } = useUpdateSection();
  const { mutate: deleteSection } = useDeleteSection();

  const sections = sectionsData?.data ?? [];
  const totalPages = Math.ceil(
    (sectionsData?.recordsFiltered ?? 0) / ITEMS_PER_PAGE
  );

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const openAddModal = () => {
    setSelectedSection(null);
    setModalMode("add");
    setSectionModalOpen(true);
  };

  const openEditModal = (section: Section) => {
    setSelectedSection({
      id: section.id,
      name: section.name,
      isActive: isActive(section),
    });
    setModalMode("edit");
    setSectionModalOpen(true);
  };

  const handleSaveSection = (data: SectionFormData) => {
    const payload: SectionCreatePayload = {
      name: data.name,
      status: toStatus(data.isActive),
      store_id: storeId,
    };
    const options = { onSuccess: () => setSectionModalOpen(false) };

    if (modalMode === "add") {
      createSection({ payload, storeId }, options);
    } else if (selectedSection?.id) {
      updateSection({ id: selectedSection.id, payload, storeId }, options);
    }
  };

  const handleToggleSection = (section: Section) => {
    updateSection({
      id: section.id,
      storeId,
      payload: {
        name: section.name,
        status: toStatus(!isActive(section)),
        store_id: storeId,
      },
    });
  };

  const handleConfirmDelete = () => {
    if (sectionToDelete === null) return;

    deleteSection(
      { id: sectionToDelete, storeId },
      {
        onSuccess: () => {
          // Last row of a non-first page just disappeared — step back a page.
          if (sections.length === 1 && currentPage > 1) {
            setCurrentPage((page) => page - 1);
          }
          setSectionToDelete(null);
        },
      }
    );
  };

  return (
    <SettingsSection value="storeSections">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Input
              type="text"
              dir="rtl"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="ابحث بإسم القسم"
              className="h-11 border-c2-neutral-200 px-4 pr-12 text-right focus-visible:ring-c2-primary"
            />
            <Search className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-c2-neutral-600" />
          </div>

          <Button
            type="button"
            onClick={openAddModal}
            className="h-11 gap-2 rounded-sm bg-c2-primary text-white hover:bg-c2-navy-600 sm:px-6"
          >
            <Plus className="size-4 sm:size-5" />
            أضف قسم جديد
          </Button>
        </div>

        <div className="overflow-x-auto rounded border border-c2-neutral-200">
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-c2-neutral-50">
                <th className="w-6/12 px-2 py-4 text-start text-sm font-medium text-c2-neutral-800">
                  اسم القسم
                </th>
                <th className="w-3/12 px-2 py-4 text-start text-sm font-medium text-c2-neutral-800">
                  الحالة
                </th>
                <th className="w-3/12 px-2 py-4 text-start text-sm font-medium text-c2-neutral-800">
                  عمليات
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <StateRow>
                  <div className="flex items-center justify-center gap-2 text-c2-neutral-600">
                    <Loader2 className="size-5 animate-spin text-c2-primary" />
                    <span>جاري تحميل البيانات...</span>
                  </div>
                </StateRow>
              ) : isError ? (
                <StateRow>
                  <p className="text-c2-danger">حدث خطأ أثناء جلب البيانات.</p>
                </StateRow>
              ) : sections.length === 0 ? (
                <StateRow>
                  <EmptyState onAdd={openAddModal} />
                </StateRow>
              ) : (
                sections.map((section) => (
                  <SectionRow
                    key={section.id}
                    section={section}
                    onEdit={openEditModal}
                    onToggle={handleToggleSection}
                    onDelete={setSectionToDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            className={isLoading ? "pointer-events-none opacity-50" : ""}
          />
        )}
      </div>

      <SectionModal
        isOpen={sectionModalOpen}
        onClose={() => setSectionModalOpen(false)}
        onSave={handleSaveSection}
        section={selectedSection}
        mode={modalMode}
      />

      <ConfirmDeleteModal
        isOpen={sectionToDelete !== null}
        onClose={() => setSectionToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="هل أنت متأكد من حذف القسم؟"
        description="لا يمكن استرجاع القسم بعد حذفه"
      />
    </SettingsSection>
  );
}

/** Full-width row used for the loading / error / empty states. */
function StateRow({ children }: { children: ReactNode }) {
  return (
    <tr>
      <td colSpan={3} className="p-8 text-center">
        {children}
      </td>
    </tr>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-c2-navy-700-a08 text-c2-primary">
        <Store className="size-6" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-c2-primary">
          لا توجد أقسام بعد
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-c2-neutral-600">
          أضف أول قسم لتنظيم منتجات المتجر وتسهيل عرضها للعملاء.
        </p>
      </div>
      <Button
        type="button"
        onClick={onAdd}
        size="sm"
        className="mt-1 rounded-sm bg-c2-primary text-white hover:bg-c2-navy-600"
      >
        أضف قسم جديد
      </Button>
    </div>
  );
}

interface SectionRowProps {
  section: Section;
  onEdit: (section: Section) => void;
  onToggle: (section: Section) => void;
  onDelete: (sectionId: number) => void;
}

function SectionRow({ section, onEdit, onToggle, onDelete }: SectionRowProps) {
  return (
    <tr className="border-b border-c2-neutral-200 transition-colors last:border-0 hover:bg-c2-neutral-50">
      <td className="px-2 py-4">
        <span className="text-sm font-medium text-c2-neutral-900">
          {section.name}
        </span>
      </td>

      <td className="px-2 py-4">
        <ToggleSwitch
          enabled={isActive(section)}
          onChange={() => onToggle(section)}
        />
      </td>

      <td className="px-2 py-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="تعديل القسم"
            onClick={() => onEdit(section)}
            className="rounded bg-c2-navy-700-a08 text-c2-primary hover:bg-c2-navy-700-a08 hover:opacity-80"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="حذف القسم"
            onClick={() => onDelete(section.id)}
            className="rounded bg-c2-red-500-a10 text-c2-danger hover:bg-c2-red-500-a10 hover:opacity-80"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
