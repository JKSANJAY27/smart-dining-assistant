import prisma from "@/lib/prisma";
import type { MenuItem } from "@prisma/client";

/** Get all available menu items */
export async function getAllMenuItems(): Promise<MenuItem[]> {
  return prisma.menuItem.findMany({
    where: { available: true },
    orderBy: [{ category: "asc" }, { popularScore: "desc" }],
  });
}

/** Get menu items by category */
export async function getMenuByCategory(category: string): Promise<MenuItem[]> {
  return prisma.menuItem.findMany({
    where: { category, available: true },
    orderBy: { popularScore: "desc" },
  });
}

/** Get popular items (by time of day — returns top popularScore items) */
export async function getPopularItems(limit = 5): Promise<MenuItem[]> {
  return prisma.menuItem.findMany({
    where: { available: true },
    orderBy: { popularScore: "desc" },
    take: limit,
  });
}

/** Get complementary items for a menu item */
export async function getComplementaryItems(itemId: string): Promise<MenuItem[]> {
  const complements = await prisma.complement.findMany({
    where: { fromId: itemId },
    include: { to: true },
    take: 4,
  });
  return complements.map((c) => c.to);
}

/** Search menu items by text query */
export async function searchMenuItems(query: string): Promise<MenuItem[]> {
  const q = query.toLowerCase().trim();
  return prisma.menuItem.findMany({
    where: {
      available: true,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { tags: { has: q } },
      ],
    },
    orderBy: { popularScore: "desc" },
    take: 20,
  });
}

/** Get a single menu item by ID */
export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  return prisma.menuItem.findUnique({ where: { id } });
}

/** Get all menu categories */
export async function getMenuCategories(): Promise<string[]> {
  const items = await prisma.menuItem.findMany({
    select: { category: true },
    distinct: ["category"],
  });
  return items.map((i) => i.category);
}

/** Increment popular score after order */
export async function incrementPopularScore(itemId: string): Promise<void> {
  await prisma.menuItem.update({
    where: { id: itemId },
    data: { popularScore: { increment: 0.01 } },
  });
}

/** Check if item is available (stock check) */
export async function validateStock(itemId: string): Promise<boolean> {
  const item = await prisma.menuItem.findUnique({
    where: { id: itemId },
    select: { available: true },
  });
  return item?.available ?? false;
}
