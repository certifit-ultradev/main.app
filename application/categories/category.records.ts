/** Persistence-neutral category data shared by category use cases and repository adapters. */
export type CategoryRecord = Readonly<{
    id: number;
    name: string;
}>;

export type CreateCategoryCommand = Readonly<{
    name: string;
}>;

/** Full category replacement: the name is required and empty input is rejected by its action schema. */
export type UpdateCategoryCommand = Readonly<{
    id: number;
    name: string;
}>;
