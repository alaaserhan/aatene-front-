"use client";

import { useState, cloneElement, isValidElement } from "react";
import { ReportAbuseModal } from "./ReportAbuseModal";

interface ReportAbuseProps {
    type: "store" | "product" | "service" | "requested_service" | "comment";
    id: number;
    children: React.ReactNode;
}

export function ReportAbuse({ type, id, children }: ReportAbuseProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = (e?: React.MouseEvent) => {
        e?.stopPropagation(); // Prevent bubbling if nested in clickable card
        e?.preventDefault();
        setIsOpen(true);
    };

    return (
        <>
            {isValidElement(children) ? (
                cloneElement(children as React.ReactElement<{ onClick?: React.MouseEventHandler }>, {
                    onClick: (e: React.MouseEvent) => {
                        handleOpen(e);
                        const element = children as React.ReactElement<{ onClick?: React.MouseEventHandler }>;
                        element.props.onClick?.(e);
                    },
                })
            ) : (
                <span onClick={handleOpen} className="cursor-pointer">
                    {children}
                </span>
            )}

            <ReportAbuseModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                type={type}
                id={id}
            />
        </>
    );
}
