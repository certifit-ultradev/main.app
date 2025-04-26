import { fetchCategoryById } from '@/actions/category/list';
import { CategoryCreateEditForm } from '@/components/category/category-form';
import { CourseCategoryData } from '@/utils/types';
import { notFound } from 'next/navigation';

export default async function EditCategoryPage({ params }) {
    const { id } = await params;
    const response = await fetchCategoryById({
        data: {
            id: Number(id)
        }
    });

    if (!response.success && !response.payload) {
        notFound();
    }

    return (
        <CategoryCreateEditForm data={response.payload as CourseCategoryData} />
    );
}
