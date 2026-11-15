import {
    changeCourseCategory,
    getAllCourseCategories,
    getCategoryById,
    registerCourseCategory,
    removeCourseCategory,
} from '@/services/categories';
import {
    allCategories,
    createCourseCategory,
    deleteCourseCategory,
    findCategoryById,
    updateCourseCategory,
} from '@/repository/categories';

jest.mock('@/repository/categories', () => ({
    allCategories: jest.fn(),
    createCourseCategory: jest.fn(),
    deleteCourseCategory: jest.fn(),
    findCategoryById: jest.fn(),
    updateCourseCategory: jest.fn(),
}));
jest.mock('@/utils/service-wrapper', () => ({ executeService: (operation: () => unknown) => operation() }));

describe('category service commands', () => {
    beforeEach(() => jest.clearAllMocks());

    it('forwards records and closed commands without CourseCategory or broad data', async () => {
        (allCategories as jest.Mock).mockResolvedValue([{ id: 1, name: 'Web' }]);
        (findCategoryById as jest.Mock).mockResolvedValue({ id: 1, name: 'Web' });
        (createCourseCategory as jest.Mock).mockResolvedValue({ id: 1, name: 'Web' });
        (updateCourseCategory as jest.Mock).mockResolvedValue({ id: 1, name: 'Datos' });
        (deleteCourseCategory as jest.Mock).mockResolvedValue({ id: 1, name: 'Datos' });

        await expect(getAllCourseCategories()).resolves.toEqual([{ id: 1, name: 'Web' }]);
        await expect(getCategoryById(1)).resolves.toEqual({ id: 1, name: 'Web' });
        await registerCourseCategory({ name: 'Web' });
        await changeCourseCategory({ id: 1, name: 'Datos' });
        await removeCourseCategory(1);

        expect(createCourseCategory).toHaveBeenCalledWith({ name: 'Web' });
        expect(updateCourseCategory).toHaveBeenCalledWith({ id: 1, name: 'Datos' });
    });
});
