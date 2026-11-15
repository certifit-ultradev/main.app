import { processCourseAssetCleanup } from '../infrastructure/blob/course-asset-cleanup';
import { prisma } from '../lib/prisma';

async function main() {
    await processCourseAssetCleanup();
}

main().finally(async () => { await prisma.$disconnect(); });
