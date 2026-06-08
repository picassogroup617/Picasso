import type { ContactPerson } from "@/domain/entities/contactPerson";

export interface CreateContactPersonData {
  name: string;
  email?: string | null;
  phone1: string;
  phone1OnWhatsapp?: boolean;
  phone2?: string | null;
  phone2OnWhatsapp?: boolean;
  order?: number;
  isActive?: boolean;
}

export interface UpdateContactPersonData {
  name?: string;
  email?: string | null;
  phone1?: string;
  phone1OnWhatsapp?: boolean;
  phone2?: string | null;
  phone2OnWhatsapp?: boolean;
  order?: number;
  isActive?: boolean;
}

export interface IContactPersonRepository {
  list(): Promise<ContactPerson[]>;
  findById(id: string): Promise<ContactPerson | null>;
  create(data: CreateContactPersonData): Promise<ContactPerson>;
  update(id: string, data: UpdateContactPersonData): Promise<ContactPerson>;
  delete(id: string): Promise<void>;
}
