interface Window {
  kafka: {
    init: (username: string) => Promise<{
      success: boolean;
      dmList: Map<string, string>;
    }>;
    sendMessage: (
      topic: string,
      message: any
    ) => Promise<{
      success: boolean;
      error?: string;
    }>;
    onMessage: (
      callback: (data: { topic: string; message: any }) => void
    ) => () => void;
    getActiveUsers: () => Promise<{
      success: boolean;
      dmList: Map<string, string>;
    }>;
    shutdown: () => Promise<void>;
  };
}
