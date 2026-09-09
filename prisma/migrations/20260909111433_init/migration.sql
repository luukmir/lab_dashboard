-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "checkInAt" TIMESTAMP(3),
    "checkInNote" TEXT,
    "checkOutAt" TIMESTAMP(3),
    "checkOutNote" TEXT,
    "stayMinutes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_date_key" ON "Attendance"("date");

-- CreateIndex
CREATE INDEX "Attendance_date_idx" ON "Attendance"("date");
