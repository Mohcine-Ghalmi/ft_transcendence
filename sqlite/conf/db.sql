CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL UNIQUE,
    "username" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "login" TEXT,
    "level" INTEGER,
    "xp" INTEGER NULL,
    "avatar" TEXT,
    "type" INTEGER,
    "resetOtp" TEXT NULL,
    "resetOtpExpireAt" TEXT NULL,
    "isOnline" BOOLEAN,
    "twoFASecret" TEXT,
    "isTwoFAVerified" BOOLEAN DEFAULT 0
);

CREATE TABLE "Messages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "message" TEXT,
    "image" TEXT,
    "seen" BOOLEAN DEFAULT FALSE,
    "date" DATETIME NOT NULL,
    CONSTRAINT "Messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Friends" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userA" TEXT NOT NULL,
    "userB" TEXT NOT NULL,
    CONSTRAINT "Friends_senderId_fkey" FOREIGN KEY ("userA") REFERENCES "User" ("email") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Friends_receiverId_fkey" FOREIGN KEY ("userB") REFERENCES "User" ("email") ON DELETE RESTRICT ON UPDATE CASCADE
    CONSTRAINT "unique_friendship" UNIQUE ("userA", "userB")
);

CREATE TABLE  FriendRequest (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  fromEmail TEXT NOT NULL,
  toEmail TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED', 'MUTED')),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (fromEmail, toEmail),

  FOREIGN KEY (fromEmail) REFERENCES User (email) ON DELETE CASCADE,
  FOREIGN KEY (toEmail) REFERENCES User (email) ON DELETE CASCADE
);

CREATE TABLE "Block" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    blockedBy TEXT NOT NULL,
    blockedUser TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (blockedBy, blockedUser)
)
