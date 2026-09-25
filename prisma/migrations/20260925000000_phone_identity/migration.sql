ALTER TABLE "User" ALTER COLUMN "clerkId" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

CREATE TABLE "PhoneAuthChallenge" (
  "id" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "userId" TEXT,
  "providerSessionId" TEXT,
  "requestIpHash" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "resendAfter" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PhoneAuthChallenge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PhoneSession" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PhoneSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PhoneSession_tokenHash_key" ON "PhoneSession"("tokenHash");
CREATE INDEX "PhoneAuthChallenge_phone_createdAt_idx" ON "PhoneAuthChallenge"("phone", "createdAt");
CREATE INDEX "PhoneAuthChallenge_requestIpHash_createdAt_idx" ON "PhoneAuthChallenge"("requestIpHash", "createdAt");
CREATE INDEX "PhoneAuthChallenge_userId_idx" ON "PhoneAuthChallenge"("userId");
CREATE INDEX "PhoneAuthChallenge_expiresAt_idx" ON "PhoneAuthChallenge"("expiresAt");
CREATE INDEX "PhoneSession_userId_idx" ON "PhoneSession"("userId");
CREATE INDEX "PhoneSession_expiresAt_idx" ON "PhoneSession"("expiresAt");

ALTER TABLE "PhoneAuthChallenge" ADD CONSTRAINT "PhoneAuthChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PhoneSession" ADD CONSTRAINT "PhoneSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
