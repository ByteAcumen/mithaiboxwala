import React from 'react';
import { notFound } from 'next/navigation';
import ProductsPage from '@/app/(storefront)/products/page';
import { connectDB } from '@/lib/db/connect';
import { Category } from '@/models';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const sParams = await searchParams;

  await connectDB();
  const category = await Category.findOne({ slug, isActive: true }).lean();
  if (!category) {
    notFound();
  }

  return (
    <ProductsPage
      searchParams={Promise.resolve({
        category: slug,
        sort: sParams.sort,
        page: sParams.page,
      })}
    />
  );
}
