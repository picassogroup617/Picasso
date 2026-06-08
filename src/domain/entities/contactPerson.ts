export interface ContactPerson {
  id: string;
  name: string;
  email: string | null;
  phone1: string;
  phone1OnWhatsapp: boolean;
  phone2: string | null;
  phone2OnWhatsapp: boolean;
  order: number;
  isActive: boolean;
}
