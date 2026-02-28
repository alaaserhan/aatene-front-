import NotificationsPage from "@/src/features/(web)/notifications/components/NotificationsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'تنبيهاتي | أعطني',
    description: 'عرض جميع تنبيهاتك في موقع أعطني',
}

export default function Page() {
    return <NotificationsPage />;
}
