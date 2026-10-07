import { fetchCategoryById } from '@/actions/category/list';
import { CategoryCreateEditForm } from '@/components/category/category-form';
import { notFound } from 'next/navigation';

interface EditCategoryPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
    const { id } = await params;
    const response = await fetchCategoryById({ id: Number(id) });

    if (!response.ok) {
        notFound();
    }

    return (
        <CategoryCreateEditForm data={response.data} />
    );
}
