import { CategoryCreateEditForm } from '@/components/category/category-form';

export default async function CreateCategoryPage()  {
    return (
        <CategoryCreateEditForm data={{
            name: ''
        }} />
    );
}

