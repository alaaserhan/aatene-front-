import { cookies } from "next/headers";
import { ProductProvidersPage } from "@/src/features/(dashboard)/products/components/ProductProvidersPage";
import { ProductsPage } from "@/src/features/(dashboard)/products/components/ProductsPage";

export default async function Page() {
  const cookieStore = await cookies();
  const userType = cookieStore.get("user_type")?.value;

  if (userType === "admin") {
    return <ProductProvidersPage />;
  }

  return <ProductsPage />;
}