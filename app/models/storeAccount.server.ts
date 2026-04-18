import prisma from "../db.server";

export type StoreAccountData = {
  shop: string;
  planName?: string;
  planStartDate?: Date | null;
  managerName?: string;
  managerEmail?: string;
  managerPhone?: string;
  portalUrl?: string;
  serviceWebsite?: boolean;
  serviceSEO?: boolean;
  serviceAdvertising?: boolean;
  serviceGEO?: boolean;
};

/**
 * Get or create a StoreAccount for a given shop.
 * If the shop has never been set up, returns a record with empty defaults.
 */
export async function getOrCreateStoreAccount(shop: string) {
  const existing = await prisma.storeAccount.findUnique({ where: { shop } });
  if (existing) return existing;

  return prisma.storeAccount.create({
    data: { shop },
  });
}

/**
 * Update account data for a shop (agency admin use).
 */
export async function upsertStoreAccount(data: StoreAccountData) {
  const { shop, ...rest } = data;
  return prisma.storeAccount.upsert({
    where: { shop },
    update: rest,
    create: { shop, ...rest },
  });
}
