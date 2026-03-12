import Footer from "@/src/components/(web)/Footer";
import Navbar from "@/src/components/(web)/Navbar";
import NewsletterFooter from "@/src/components/(web)/NewsletterFooter";
import BotChat from "@/src/components/(web)/BotChat";
import NotificationPromptPopup from "@/src/components/(web)/NotificationPromptPopup";
import React from "react";

export default function WebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen justify-between">
      <Navbar />
      <main className="flex-1 flex flex-col bg-white">
        {children}
        <NewsletterFooter />
      </main>
      <Footer />
      <BotChat />
      <NotificationPromptPopup />
    </div>
  );
}
