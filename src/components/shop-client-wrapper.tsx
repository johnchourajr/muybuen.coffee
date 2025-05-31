"use client";

import { ShopTemplate } from "@/components/shop.template";
import { useBusinessDetails } from "@/hooks/useSearchQueries";

interface ShopClientWrapperProps {
  businessId: string;
  initialData?: any;
}

export const ShopClientWrapper = ({
  businessId,
  initialData,
}: ShopClientWrapperProps) => {
  const {
    data: shop,
    isLoading,
    error,
  } = useBusinessDetails(businessId, {
    enabled: !!businessId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shop details...</p>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Shop not found</h1>
          <p className="text-gray-600">
            {error?.message || "Unable to load shop details."}
          </p>
        </div>
      </div>
    );
  }

  return <ShopTemplate shop={shop} />;
};
