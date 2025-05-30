import { ShopTemplate } from "@/components/shop.template";
import { Business } from "@/types/search.types";

// Function to get shop data from our API
const getShopData = async (id: string): Promise<Business | null> => {
  try {
    // Use the production domain directly for production, localhost for development
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://muybuen.coffee" // Your production domain
        : "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/business/${id}`, {
      cache: "force-cache", // Cache the response
    });

    if (!response.ok) {
      console.error("Failed to fetch business data:", response.status);
      return null;
    }

    const result = await response.json();

    if (!result.success) {
      console.error("API returned error:", result.error);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error("Failed to fetch shop data:", error);
    return null;
  }
};

export default async function ShopPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params before accessing properties
  const { id } = await params;
  const shop = await getShopData(id);

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Shop not found</h1>
          <p className="text-gray-600">Unable to load shop details.</p>
        </div>
      </div>
    );
  }

  return <ShopTemplate shop={shop} />;
}
