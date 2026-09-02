// src/features/(dashboard)/stores/components/StoreShippingFields.tsx
"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { AddShippingCompanyDialog } from "./AddShippingCompanyDialog";
import { useGetCities } from "../../cities/hooks";
import { DeliveryType, ShippingCompanyPayload } from "../api";
import { StoreShippingValues } from "../types";

interface StoreShippingFieldsProps {
  values: StoreShippingValues;
  onChange: (values: StoreShippingValues) => void;
}

/**
 * Delivery method of a products store: hand delivery, or a list of shipping
 * companies with their per-city prices. Fully controlled — the parent owns the
 * values and decides when they are persisted.
 */
export function StoreShippingFields({
  values,
  onChange,
}: StoreShippingFieldsProps) {
  const { delivery_type: deliveryType, shippingCompanies } = values;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompanyIndex, setEditingCompanyIndex] = useState<number | null>(
    null
  );

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [companyToDeleteIndex, setCompanyToDeleteIndex] = useState<
    number | null
  >(null);
  const [deliveryTypeWarningOpen, setDeliveryTypeWarningOpen] = useState(false);

  const { data: citiesData } = useGetCities(new URLSearchParams());
  const cities = citiesData?.data || [];

  const handleDeliveryTypeChange = (nextDeliveryType: DeliveryType) => {
    if (nextDeliveryType === deliveryType) return;

    // Switching away from shipping drops the companies, so confirm first
    if (nextDeliveryType === "hand_delivery" && shippingCompanies.length > 0) {
      setDeliveryTypeWarningOpen(true);
      return;
    }

    onChange({
      delivery_type: nextDeliveryType,
      shippingCompanies:
        nextDeliveryType === "shipping" ? shippingCompanies : [],
    });
  };

  const handleConfirmHandDelivery = () => {
    onChange({ delivery_type: "hand_delivery", shippingCompanies: [] });
    setDeliveryTypeWarningOpen(false);
  };

  const handleAddCompany = () => {
    setEditingCompanyIndex(null);
    setIsDialogOpen(true);
  };

  const handleEditCompany = (index: number) => {
    setEditingCompanyIndex(index);
    setIsDialogOpen(true);
  };

  /** `null` index means "delete all companies". */
  const handleRemoveCompanyClick = (index: number) => {
    setCompanyToDeleteIndex(index);
    setDeleteModalOpen(true);
  };

  const handleRemoveAllClick = () => {
    setCompanyToDeleteIndex(null);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    const nextCompanies =
      companyToDeleteIndex !== null
        ? shippingCompanies.filter((_, i) => i !== companyToDeleteIndex)
        : [];

    onChange({ delivery_type: deliveryType, shippingCompanies: nextCompanies });
    setDeleteModalOpen(false);
    setCompanyToDeleteIndex(null);
  };

  const handleSaveCompany = (company: ShippingCompanyPayload) => {
    const nextCompanies =
      editingCompanyIndex !== null
        ? shippingCompanies.map((c, i) =>
            i === editingCompanyIndex ? company : c
          )
        : [...shippingCompanies, company];

    onChange({ delivery_type: "shipping", shippingCompanies: nextCompanies });
  };

  /** The first company in the list is the store's default one. */
  const handleSetDefault = (index: number) => {
    if (index === 0) return;

    const companyToMove = shippingCompanies[index];
    const otherCompanies = shippingCompanies.filter((_, i) => i !== index);

    onChange({
      delivery_type: deliveryType,
      shippingCompanies: [companyToMove, ...otherCompanies],
    });
  };

  const getCompanyCities = (company: ShippingCompanyPayload) => {
    if (!company.prices?.length) return "";
    const cityNames = company.prices
      .map((price) => cities.find((c) => c.id === price.city_id)?.name)
      .filter(Boolean);

    return cityNames.length > 0 ? `من ${cityNames.join("، ")}` : "";
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h3 className="text-sm sm:text-base font-medium mb-3 sm:mb-4 text-right">
          كيف تود شحن المنتجات؟
        </h3>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
          <DeliveryOption
            label='من يد لـ يد "دون شركات توصيل"'
            selected={deliveryType === "hand_delivery"}
            onClick={() => handleDeliveryTypeChange("hand_delivery")}
          />

          <DeliveryOption
            label="من خلال شركة توصيل"
            selected={deliveryType === "shipping"}
            onClick={() => handleDeliveryTypeChange("shipping")}
          />
        </div>
      </div>

      {deliveryType === "shipping" && (
        <div className="space-y-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
            <h3 className="text-base sm:text-lg font-semibold">شركات الشحن</h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {shippingCompanies.length > 0 && (
                <Button
                  onClick={handleRemoveAllClick}
                  variant="outline"
                  className="text-red-1 bg-transparent shadow-none hover:bg-transparent border-none"
                >
                  حذف الكل
                </Button>
              )}
              <Button
                onClick={handleAddCompany}
                className="bg-blue-6 border-blue-4 border text-blue-4 rounded-full px-3 sm:px-4 text-sm sm:text-base flex-1 sm:flex-none"
              >
                إضافة شركة شحن
              </Button>
            </div>
          </div>

          {shippingCompanies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-2 text-sm">
                حتى الآن لا يوجد شركات شحن مضافة
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {shippingCompanies.map((company, index) => {
                const isDefault = index === 0;
                return (
                  <div
                    key={index}
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-md transition-colors bg-white border-gray-200"
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <h4 className="text-sm sm:text-base font-semibold mb-1 break-words">
                        {company.name || "شركة شحن"}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-2 break-words">
                        {getCompanyCities(company)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:justify-end">
                      <Button
                        onClick={() => handleRemoveCompanyClick(index)}
                        variant="outline"
                        className="p-2 border-red-1 bg-red-2 text-red-1 font-medium px-3 sm:px-4 rounded-full text-xs sm:text-sm h-9"
                      >
                        <img
                          src="/icons/dashboard/trash.svg"
                          className="w-4 h-4"
                          alt=""
                        />
                        <p>حذف</p>
                      </Button>
                      <Button
                        onClick={() => handleEditCompany(index)}
                        variant="outline"
                        className="p-2 border-blue-4 bg-blue-6 hover:bg-blue-1 text-blue-4 font-medium px-3 sm:px-4 rounded-full text-xs sm:text-sm h-9"
                      >
                        <img
                          src="/icons/dashboard/edit2.svg"
                          className="w-4 h-4"
                          alt=""
                        />
                        <p>تعديل</p>
                      </Button>

                      <Button
                        onClick={() => handleSetDefault(index)}
                        variant={isDefault ? "default" : "outline"}
                        className={cn(
                          "rounded-full px-4 py-2 text-sm h-9 border-none shadow-none",
                          isDefault
                            ? "bg-[#11CAEF] text-white hover:bg-[#0eaac1]"
                            : "bg-gray-4 text-gray-2 hover:bg-gray-200"
                        )}
                      >
                        أساسي
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <AddShippingCompanyDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingCompanyIndex(null);
        }}
        onSave={handleSaveCompany}
        editingCompany={
          editingCompanyIndex !== null
            ? shippingCompanies[editingCompanyIndex]
            : null
        }
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCompanyToDeleteIndex(null);
        }}
        onConfirm={handleConfirmDelete}
        title={
          companyToDeleteIndex !== null
            ? "حذف شركة الشحن"
            : "حذف جميع شركات الشحن"
        }
        description={
          companyToDeleteIndex !== null
            ? "هل أنت متأكد من رغبتك في حذف شركة الشحن هذه؟ لن يكتمل الحذف إلا بعد حفظ القسم."
            : "هل أنت متأكد من رغبتك في حذف جميع شركات الشحن المضافة؟ لن يكتمل الحذف إلا بعد حفظ القسم."
        }
        confirmText={
          companyToDeleteIndex !== null ? "نعم، احذف" : "نعم، احذف الكل"
        }
      />

      <ConfirmDeleteModal
        isOpen={deliveryTypeWarningOpen}
        onClose={() => setDeliveryTypeWarningOpen(false)}
        onConfirm={handleConfirmHandDelivery}
        title="تغيير طريقة الشحن إلى من يد ليد؟"
        description="سيتم حذف شركات الشحن الحالية من إعدادات المتجر وتحديث طريقة الشحن للعملاء إلى من يد ليد."
        confirmText="نعم، حدّث واحذف الشركات"
        cancelText="إلغاء"
      />
    </div>
  );
}

interface DeliveryOptionProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

function DeliveryOption({ label, selected, onClick }: DeliveryOptionProps) {
  return (
    <div onClick={onClick} className="flex items-start gap-2 cursor-pointer">
      <div className="flex-shrink-0 mt-0.5">
        <div
          className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
            selected ? "border-[#3A5779]" : "border-gray-300"
          )}
        >
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-[#3A5779]" />}
        </div>
      </div>
      <div className="flex-1">
        <h4
          className={cn(
            "font-medium text-sm",
            selected ? "text-[#3A5779]" : "text-gray-2"
          )}
        >
          {label}
        </h4>
      </div>
    </div>
  );
}
