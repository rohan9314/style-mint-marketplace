"use client";

import { Checkout } from "@moneydevkit/nextjs";

interface CheckoutPageProps {
  params: Promise<{ id: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { id } = await params;
  return <Checkout id={id} />;
}
