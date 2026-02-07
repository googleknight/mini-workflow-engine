/*
  Warnings:

  - The primary key for the `workflow_runs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `workflow_runs` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `workflow_id` on the `workflow_runs` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The primary key for the `workflows` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `workflows` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- DropForeignKey
ALTER TABLE "workflow_runs" DROP CONSTRAINT "workflow_runs_workflow_id_fkey";

-- AlterTable
ALTER TABLE "workflow_runs" DROP CONSTRAINT "workflow_runs_pkey",
ALTER COLUMN "id" SET DATA TYPE INTEGER,
ALTER COLUMN "workflow_id" SET DATA TYPE INTEGER,
ADD CONSTRAINT "workflow_runs_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "workflows" DROP CONSTRAINT "workflows_pkey",
ALTER COLUMN "id" SET DATA TYPE INTEGER,
ADD CONSTRAINT "workflows_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "workflow_runs" ADD CONSTRAINT "workflow_runs_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
