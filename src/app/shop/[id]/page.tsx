import { ShopClientWrapper } from "@/components/shop-client-wrapper";

export default async function ShopPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params before accessing properties
  const { id } = await params;

  return <ShopClientWrapper businessId={id} />;
}
