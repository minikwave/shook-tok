-- CreateEnum
CREATE TYPE "PokeStatus" AS ENUM ('PENDING', 'RESPONDED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "discordUserId" TEXT NOT NULL,
    "username" TEXT,
    "avatarUrl" TEXT,
    "pointsBalance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Server" (
    "id" TEXT NOT NULL,
    "discordGuildId" TEXT NOT NULL,
    "name" TEXT,
    "defaultChannelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Poke" (
    "id" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "emotion" TEXT,
    "message" TEXT,
    "status" "PokeStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "Poke_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointLedger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "refType" TEXT,
    "refId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Relationship" (
    "id" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "streakCount" INTEGER NOT NULL DEFAULT 0,
    "totalInteractions" INTEGER NOT NULL DEFAULT 0,
    "lastInteractionAt" TIMESTAMP(3),
    "lastStreakDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Relationship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_discordUserId_key" ON "User"("discordUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Server_discordGuildId_key" ON "Server"("discordGuildId");

-- CreateIndex
CREATE INDEX "Poke_serverId_idx" ON "Poke"("serverId");

-- CreateIndex
CREATE INDEX "Poke_senderId_idx" ON "Poke"("senderId");

-- CreateIndex
CREATE INDEX "Poke_receiverId_idx" ON "Poke"("receiverId");

-- CreateIndex
CREATE INDEX "Poke_createdAt_idx" ON "Poke"("createdAt");

-- CreateIndex
CREATE INDEX "PointLedger_userId_idx" ON "PointLedger"("userId");

-- CreateIndex
CREATE INDEX "PointLedger_serverId_idx" ON "PointLedger"("serverId");

-- CreateIndex
CREATE INDEX "PointLedger_createdAt_idx" ON "PointLedger"("createdAt");

-- CreateIndex
CREATE INDEX "Relationship_serverId_idx" ON "Relationship"("serverId");

-- CreateIndex
CREATE INDEX "Relationship_userAId_idx" ON "Relationship"("userAId");

-- CreateIndex
CREATE INDEX "Relationship_userBId_idx" ON "Relationship"("userBId");

-- CreateIndex
CREATE UNIQUE INDEX "Relationship_serverId_userAId_userBId_key" ON "Relationship"("serverId", "userAId", "userBId");

-- AddForeignKey
ALTER TABLE "Poke" ADD CONSTRAINT "Poke_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poke" ADD CONSTRAINT "Poke_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poke" ADD CONSTRAINT "Poke_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointLedger" ADD CONSTRAINT "PointLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointLedger" ADD CONSTRAINT "PointLedger_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE ON UPDATE CASCADE;
