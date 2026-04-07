import { Metadata } from "next";
import { ContactsPage } from "@/src/features/(dashboard)/contacts/components/ContactsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardContacts");

export default function ContactsRoute() {
    return <ContactsPage />;
}
