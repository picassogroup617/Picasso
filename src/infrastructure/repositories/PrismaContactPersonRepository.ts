import type { PrismaClient } from "@prisma/client";
import type {
  CreateContactPersonData,
  IContactPersonRepository,
  UpdateContactPersonData,
} from "@/domain/interfaces/IContactPersonRepository";
import type { ContactPerson } from "@/domain/entities/contactPerson";

export class PrismaContactPersonRepository implements IContactPersonRepository {
  constructor(private readonly db: PrismaClient) {}

  private toEntity(row: {
    id: string;
    name: string;
    email: string | null;
    phone1: string;
    phone1OnWhatsapp: boolean;
    phone2: string | null;
    phone2OnWhatsapp: boolean;
    order: number;
    isActive: boolean;
  }): ContactPerson {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone1: row.phone1,
      phone1OnWhatsapp: row.phone1OnWhatsapp,
      phone2: row.phone2,
      phone2OnWhatsapp: row.phone2OnWhatsapp,
      order: row.order,
      isActive: row.isActive,
    };
  }

  async list(): Promise<ContactPerson[]> {
    const rows = await this.db.contactPerson.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    return rows.map((r) => this.toEntity(r));
  }

  async findById(id: string): Promise<ContactPerson | null> {
    const row = await this.db.contactPerson.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async create(data: CreateContactPersonData): Promise<ContactPerson> {
    const row = await this.db.contactPerson.create({
      data: {
        name: data.name,
        email: data.email ?? null,
        phone1: data.phone1,
        phone1OnWhatsapp: data.phone1OnWhatsapp ?? false,
        phone2: data.phone2 ?? null,
        phone2OnWhatsapp: data.phone2OnWhatsapp ?? false,
        order: data.order ?? 0,
        isActive: data.isActive ?? true,
      },
    });
    return this.toEntity(row);
  }

  async update(id: string, data: UpdateContactPersonData): Promise<ContactPerson> {
    const row = await this.db.contactPerson.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone1 !== undefined && { phone1: data.phone1 }),
        ...(data.phone1OnWhatsapp !== undefined && {
          phone1OnWhatsapp: data.phone1OnWhatsapp,
        }),
        ...(data.phone2 !== undefined && { phone2: data.phone2 }),
        ...(data.phone2OnWhatsapp !== undefined && {
          phone2OnWhatsapp: data.phone2OnWhatsapp,
        }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
    return this.toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.db.contactPerson.delete({ where: { id } });
  }
}
