import type { Metadata } from "next";
import { TablePage } from "@/components/table/TablePage";

interface Props {
  params: Promise<{ tableId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tableId } = await params;
  return {
    title: `Table ${tableId} | Smart Dining`,
    description: `Welcome to your table! Chat with Zara, our AI dining assistant, to explore the menu and place your order.`,
  };
}

export default async function TableRoute({ params }: Props) {
  const { tableId } = await params;
  return <TablePage tableId={tableId} />;
}
