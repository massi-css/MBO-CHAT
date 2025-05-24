export const TOPICS = {
  GLOBAL: "global-chat",
  USERS: "active-users",
  DM: "private-messages",
  USER_JOINED: "user-joined",
  USER_LEFT: "user-left",
} as const;

export type TopicType = (typeof TOPICS)[keyof typeof TOPICS];
