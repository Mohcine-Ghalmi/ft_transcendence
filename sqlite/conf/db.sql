CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL UNIQUE,
    "username" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "login" TEXT NOT NULL UNIQUE,
    "level" INTEGER DEFAULT 0,
    "xp" INTEGER DEFAULT 0,
    "avatar" TEXT,
    "type" INTEGER DEFAULT 0,
    "resetOtp" TEXT NULL,
    "resetOtpExpireAt" TEXT NULL,
    "twoFASecret" TEXT NULL,
    "isTwoFAVerified" BOOLEAN DEFAULT 0
);

CREATE TABLE "Messages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "message" TEXT,
    "image" TEXT,
    "seen" BOOLEAN DEFAULT FALSE,
    "date" DATETIME DEFAULT CURRENT_TIMESTAMP,
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
);

CREATE TABLE "match_history" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "game_id" TEXT UNIQUE NOT NULL,
    "player1_email" TEXT NOT NULL,
    "player2_email" TEXT NOT NULL,
    "player1_score" INTEGER NOT NULL DEFAULT 0,
    "player2_score" INTEGER NOT NULL DEFAULT 0,
    "winner" TEXT NOT NULL,
    "loser" TEXT NOT NULL,
    "game_duration" INTEGER NOT NULL DEFAULT 0,
    "started_at" INTEGER NOT NULL,
    "ended_at" INTEGER NOT NULL,
    "game_mode" TEXT NOT NULL DEFAULT '1v1',
    "status" TEXT NOT NULL DEFAULT 'completed',
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("player1_email") REFERENCES "User" ("email") ON DELETE CASCADE,
    FOREIGN KEY ("player2_email") REFERENCES "User" ("email") ON DELETE CASCADE,
    FOREIGN KEY ("winner") REFERENCES "User" ("email") ON DELETE CASCADE,
    FOREIGN KEY ("loser") REFERENCES "User" ("email") ON DELETE CASCADE
);