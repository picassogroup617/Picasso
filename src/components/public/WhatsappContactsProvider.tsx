"use client";

import { createContext, useContext, type ReactNode } from "react";

export interface WhatsappContact {
  /** Display name from the ContactPerson record. */
  name: string;
  /** Raw phone number as entered (e.g. "+91 98xxx xxxxx"). */
  phone: string;
}

const WhatsappContactsContext = createContext<WhatsappContact[]>([]);

/**
 * Exposes the active WhatsApp-enabled contacts to descendants so the
 * QuoteRequestModal can offer a "chat directly on WhatsApp" shortcut
 * without prop-drilling through every QuoteRequestButton call site.
 */
export function WhatsappContactsProvider({
  contacts,
  children,
}: {
  contacts: WhatsappContact[];
  children: ReactNode;
}) {
  return (
    <WhatsappContactsContext.Provider value={contacts}>
      {children}
    </WhatsappContactsContext.Provider>
  );
}

export function useWhatsappContacts(): WhatsappContact[] {
  return useContext(WhatsappContactsContext);
}
