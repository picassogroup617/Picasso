import type { IContactPersonRepository } from "@/domain/interfaces/IContactPersonRepository";
import type { ContactPerson } from "@/domain/entities/contactPerson";
import type { ContactPersonInput } from "@/domain/schemas/contact";

export class ContactPersonService {
  constructor(private readonly repo: IContactPersonRepository) {}

  list() {
    return this.repo.list();
  }

  getById(id: string) {
    return this.repo.findById(id);
  }

  create(input: ContactPersonInput): Promise<ContactPerson> {
    return this.repo.create({
      name: input.name,
      email: input.email ?? null,
      phone1: input.phone1,
      phone1OnWhatsapp: input.phone1OnWhatsapp,
      phone2: input.phone2 ?? null,
      phone2OnWhatsapp: input.phone2OnWhatsapp,
      order: input.order,
      isActive: input.isActive,
    });
  }

  async update(id: string, input: ContactPersonInput): Promise<ContactPerson> {
    const target = await this.repo.findById(id);
    if (!target) throw new Error("Contact person not found.");
    return this.repo.update(id, {
      name: input.name,
      email: input.email ?? null,
      phone1: input.phone1,
      phone1OnWhatsapp: input.phone1OnWhatsapp,
      phone2: input.phone2 ?? null,
      phone2OnWhatsapp: input.phone2OnWhatsapp,
      order: input.order,
      isActive: input.isActive,
    });
  }

  async delete(id: string): Promise<void> {
    const target = await this.repo.findById(id);
    if (!target) return;
    await this.repo.delete(id);
  }
}
