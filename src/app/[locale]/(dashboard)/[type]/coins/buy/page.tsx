// ============================================================
// ⚠️  صفحة شراء العملات الذهبية (Coins) - معطّلة مؤقتاً
// لإعادة تفعيلها: احذف /* COINS_DISABLED_START و COINS_DISABLED_END */
// ============================================================

/* COINS_DISABLED_START

import { Metadata } from "next";
import { BuyPointsPageContent } from "@/src/features/(dashboard)/coins/components/BuyPointsPageContent";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardCoins");

export default function Page() {
    return <BuyPointsPageContent />;
}

COINS_DISABLED_END */

// صفحة مؤقتة بدلاً من صفحة الشراء
export default function Page() {
    return null;
}
