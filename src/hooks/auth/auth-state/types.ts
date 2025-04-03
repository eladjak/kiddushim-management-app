
import type { Logger } from "@/utils/logger";

export interface AuthStateRef {
  mountedRef: React.MutableRefObject<boolean>;
  initializeRef?: React.MutableRefObject<boolean>;
  checkSessionCalledRef?: React.MutableRefObject<boolean>;
  subscriptionRef?: React.MutableRefObject<any>;
}

export interface LoggerProvider {
  log: Logger;
}
