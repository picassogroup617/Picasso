/**
 * Tiny dependency-injection container.
 *
 * Wires concrete infrastructure implementations to domain interfaces.
 * Application code imports from here, not from `infrastructure/` directly.
 *
 * Add new bindings as new repositories / services are introduced in later phases.
 */
import { prisma } from "./prisma";
import { PrismaUserRepository } from "@/infrastructure/repositories/PrismaUserRepository";
import { PrismaSiteContentRepository } from "@/infrastructure/repositories/PrismaSiteContentRepository";
import { PrismaContactPersonRepository } from "@/infrastructure/repositories/PrismaContactPersonRepository";
import { PrismaSocialLinkRepository } from "@/infrastructure/repositories/PrismaSocialLinkRepository";
import { PrismaCategoryRepository } from "@/infrastructure/repositories/PrismaCategoryRepository";
import { PrismaProductRepository } from "@/infrastructure/repositories/PrismaProductRepository";
import { PrismaQuoteRepository } from "@/infrastructure/repositories/PrismaQuoteRepository";
import { CloudinaryImageStorage } from "@/infrastructure/uploads/cloudinary";
import { PrismaImageUsage } from "@/infrastructure/repositories/PrismaImageUsage";
import { createNotificationService } from "@/infrastructure/notifications/createNotificationService";
import { hashPassword, verifyPassword } from "@/infrastructure/auth/password";
import { UserService, type IPasswordHasher } from "@/application/services/UserService";
import { SiteContentService } from "@/application/services/SiteContentService";
import { ContactPersonService } from "@/application/services/ContactPersonService";
import { SocialLinkService } from "@/application/services/SocialLinkService";
import { CategoryService } from "@/application/services/CategoryService";
import { ProductService } from "@/application/services/ProductService";
import { QuoteService } from "@/application/services/QuoteService";
import type { IUserRepository } from "@/domain/interfaces/IUserRepository";
import type { ISiteContentRepository } from "@/domain/interfaces/ISiteContentRepository";
import type { IContactPersonRepository } from "@/domain/interfaces/IContactPersonRepository";
import type { ISocialLinkRepository } from "@/domain/interfaces/ISocialLinkRepository";
import type { ICategoryRepository } from "@/domain/interfaces/ICategoryRepository";
import type { IProductRepository } from "@/domain/interfaces/IProductRepository";
import type { IQuoteRepository } from "@/domain/interfaces/IQuoteRepository";
import type { IImageStorage } from "@/domain/interfaces/IImageStorage";
import type { IImageUsage } from "@/domain/interfaces/IImageUsage";
import type { INotificationService } from "@/domain/interfaces/INotificationService";

export interface AppContainer {
  userRepository: IUserRepository;
  siteContentRepository: ISiteContentRepository;
  contactPersonRepository: IContactPersonRepository;
  socialLinkRepository: ISocialLinkRepository;
  categoryRepository: ICategoryRepository;
  productRepository: IProductRepository;
  quoteRepository: IQuoteRepository;
  imageStorage: IImageStorage;
  imageUsage: IImageUsage;
  notificationService: INotificationService;
  passwordHasher: IPasswordHasher;
  userService: UserService;
  siteContentService: SiteContentService;
  contactPersonService: ContactPersonService;
  socialLinkService: SocialLinkService;
  categoryService: CategoryService;
  productService: ProductService;
  quoteService: QuoteService;
}

let cached: AppContainer | null = null;

export function getContainer(): AppContainer {
  if (cached) return cached;

  const userRepository = new PrismaUserRepository(prisma);
  const siteContentRepository = new PrismaSiteContentRepository(prisma);
  const contactPersonRepository = new PrismaContactPersonRepository(prisma);
  const socialLinkRepository = new PrismaSocialLinkRepository(prisma);
  const categoryRepository = new PrismaCategoryRepository(prisma);
  const productRepository = new PrismaProductRepository(prisma);
  const quoteRepository = new PrismaQuoteRepository(prisma);
  const imageStorage = new CloudinaryImageStorage();
  const imageUsage = new PrismaImageUsage(prisma);
  const notificationService = createNotificationService();

  const passwordHasher: IPasswordHasher = { hash: hashPassword, verify: verifyPassword };

  const userService = new UserService(userRepository, passwordHasher);
  const siteContentService = new SiteContentService(siteContentRepository, imageStorage, imageUsage);
  const contactPersonService = new ContactPersonService(contactPersonRepository);
  const socialLinkService = new SocialLinkService(socialLinkRepository);
  const categoryService = new CategoryService(categoryRepository, imageStorage, imageUsage);
  const productService = new ProductService(productRepository, categoryRepository, imageStorage, imageUsage);
  const quoteService = new QuoteService(quoteRepository, productRepository, notificationService);

  cached = {
    userRepository,
    siteContentRepository,
    contactPersonRepository,
    socialLinkRepository,
    categoryRepository,
    productRepository,
    quoteRepository,
    imageStorage,
    imageUsage,
    notificationService,
    passwordHasher,
    userService,
    siteContentService,
    contactPersonService,
    socialLinkService,
    categoryService,
    productService,
    quoteService,
  };
  return cached;
}
