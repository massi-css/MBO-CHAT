import { Kafka, logLevel, Consumer, EachMessagePayload } from "kafkajs";
import { TOPICS as KAFKA_TOPICS } from "../../../src/shared/kafka-types";

// Kafka connection configuration
const kafka = new Kafka({
  clientId: "electron-chat-app",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  logLevel: logLevel.NOTHING,
  connectionTimeout: 3000,
  requestTimeout: 30000,
});

// Initialize Kafka components
const producer = kafka.producer();
const admin = kafka.admin();
let consumer: Consumer;
let consumerId: string;

// Use the imported TOPICS
export { KAFKA_TOPICS as TOPICS };

// Utility functions
export function createConsumerUsername(username: string): string {
  const sanitizedUsername = username.replace(/[^a-zA-Z0-9]/g, "");
  return `chat-user-${sanitizedUsername}-${Math.random()
    .toString(36)
    .substring(7)}`;
}

export function extractUsernameFromConsumerId(
  consumerId: string
): string | null {
  const match = consumerId.match(/chat-user-(.*?)-[a-z0-9]+$/);
  return match ? match[1] : null;
}

// Get active users
export async function getActiveUsers(): Promise<Map<string, string>> {
  try {
    const groups = await admin.listGroups();
    const activeUsers = new Map();

    for (const group of groups.groups) {
      if (group.groupId.startsWith("chat-user-")) {
        const desc = await admin.describeGroups([group.groupId]);
        const groupInfo = desc.groups[0];

        if (groupInfo.state === "Stable") {
          const username = extractUsernameFromConsumerId(group.groupId);
          if (username) {
            activeUsers.set(username, group.groupId);
          }
        }
      }
    }

    return activeUsers;
  } catch (error) {
    console.error("Failed to get active users:", error);
    return new Map();
  }
}

// Initialize Kafka connection
export async function initKafka(username: string) {
  try {
    consumerId = createConsumerUsername(username);
    consumer = kafka.consumer({
      groupId: consumerId,
    });

    await producer.connect();
    await consumer.connect();
    await admin.connect();

    // Ensure topics exist
    await admin.createTopics({
      topics: Object.values(KAFKA_TOPICS).map((topic) => ({
        topic,
        numPartitions: 1,
        replicationFactor: 1,
      })),
    });
    await sendMessage(KAFKA_TOPICS.USER_JOINED, {
      username,
      consumerId,
    });

    const initialDmList = await getActiveUsers();
    return { success: true, dmList: initialDmList };
  } catch (error) {
    console.error("Failed to initialize Kafka:", error);
    return { success: false, dmList: new Map() };
  }
}

// Subscribe to topics
export async function subscribe(
  topics: string[],
  messageHandler: (topic: string, value: any) => void
) {
  try {
    await consumer.subscribe({ topics, fromBeginning: false });
    await consumer.run({
      eachMessage: async ({
        topic,
        partition,
        message,
      }: EachMessagePayload) => {
        const value = JSON.parse(message.value?.toString() || "{}");
        // All messages are passed directly to the message handler
        messageHandler(topic, value);
      },
    });
    return true;
  } catch (error) {
    throw new Error(`Subscription failed: ${(error as Error).message}`);
  }
}

// Send message to topic
export async function sendMessage(topic: string, message: unknown) {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    return true;
  } catch (error) {
    throw new Error(`Failed to send message: ${(error as Error).message}`);
  }
}

// Clean shutdown
export async function shutdown() {
  try {
    const username = extractUsernameFromConsumerId(consumerId);

    if (username) {
      await sendMessage(KAFKA_TOPICS.USER_LEFT, {
        username,
        consumerId,
      });
    }

    await consumer?.disconnect();
    await producer?.disconnect();
    await admin?.disconnect();
  } catch (error) {
    console.error("Failed to shutdown Kafka:", error);
  }
}
