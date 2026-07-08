-- AlterTable
ALTER TABLE "User" ADD COLUMN     "city" TEXT,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "HadithBookmark" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "hadithId" TEXT NOT NULL,
    "collectionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HadithBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HadithBookmark_userId_idx" ON "HadithBookmark"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HadithBookmark_userId_hadithId_key" ON "HadithBookmark"("userId", "hadithId");

-- AddForeignKey
ALTER TABLE "HadithBookmark" ADD CONSTRAINT "HadithBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
