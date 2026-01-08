import { BuyPointsPageContent } from "@/src/features/(dashboard)/coins/components/BuyPointsPageContent";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "شراء عملات ذهبية",
    description: "اشحن رصيدك من العملات الذهبية",
};

export default function Page() {
    return <BuyPointsPageContent />;
}
