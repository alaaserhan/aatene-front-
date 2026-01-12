// src/features/(dashboard)/settings/components/MapModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress: (address: string, lat: number, lng: number) => void;
  initialAddress?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export function MapModal({
  isOpen,
  onClose,
  onSelectAddress,
  initialAddress,
}: MapModalProps) {
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const script = document.createElement("script");

      // --- (هذا هو السطر الذي تم تعديله) ---
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`;
      // --- نهاية التعديل ---

      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;

      const defaultCenter = { lat: 30.0444, lng: 31.2357 };

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
      });

      markerRef.current = new window.google.maps.Marker({
        map: mapInstanceRef.current,
        position: defaultCenter,
        draggable: true,
      });

      mapInstanceRef.current.addListener("click", (e: any) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        updateMarkerAndAddress(lat, lng);
      });

      markerRef.current.addListener("dragend", (e: any) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        updateMarkerAndAddress(lat, lng);
      });

      setIsLoading(false);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            mapInstanceRef.current.setCenter(pos);
            markerRef.current.setPosition(pos);
            updateMarkerAndAddress(pos.lat, pos.lng);
          },
          () => {
            updateMarkerAndAddress(defaultCenter.lat, defaultCenter.lng);
          }
        );
      } else {
        updateMarkerAndAddress(defaultCenter.lat, defaultCenter.lng);
      }
    };

    const updateMarkerAndAddress = (lat: number, lng: number) => {
      markerRef.current.setPosition({ lat, lng });
      setSelectedCoords({ lat, lng });

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        if (status === "OK" && results[0]) {
          setSelectedAddress(results[0].formatted_address);
        }
      });
    };

    loadGoogleMaps();
  }, [isOpen]);

  const handleConfirm = () => {
    if (selectedAddress && selectedCoords) {
      onSelectAddress(selectedAddress, selectedCoords.lat, selectedCoords.lng);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">اختر الموقع من الخريطة</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-4 mx-auto mb-4"></div>
                <p className="text-gray-2">جاري تحميل الخريطة...</p>
              </div>
            </div>
          )}
          <div ref={mapRef} className="w-full h-[500px]" />
        </div>

        {/* Selected Address Display */}
        {selectedAddress && (
          <div className="p-4 bg-gray-50 border-t">
            <p className="text-sm text-gray-2 mb-1">العنوان المختار:</p>
            <p className="font-medium text-gray-900">{selectedAddress}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="px-6"
          >
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedAddress}
            className="px-6 bg-blue-4 text-white hover:bg-blue-3"
          >
            تأكيد الموقع
          </Button>
        </div>
      </div>
    </div>
  );
}