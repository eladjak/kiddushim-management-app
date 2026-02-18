import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger, LogLevel } from "../logger";

describe("logger", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("logger.info calls console.info with formatted message", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    logger.info("test message");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("[info]");
    expect(spy.mock.calls[0][0]).toContain("test message");
  });

  it("logger.warn calls console.warn", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logger.warn("warning message");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("warning message");
  });

  it("logger.error calls console.error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("error message");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("error message");
  });

  it("logger.debug calls console.debug", () => {
    const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
    logger.debug("debug message");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("debug message");
  });

  it("passes context object to console calls", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const ctx = { component: "TestComponent", action: "test" };
    logger.info("with context", ctx);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][1]).toEqual(ctx);
  });

  it("createLogger merges default context with per-call context", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const log = logger.createLogger({ component: "MyComp" });
    log.info("hello", { action: "click" });
    expect(spy).toHaveBeenCalledTimes(1);
    // The context passed should include both component and action
    const passedContext = spy.mock.calls[0][1];
    expect(passedContext).toEqual(expect.objectContaining({ component: "MyComp", action: "click" }));
  });
});

describe("LogLevel enum", () => {
  it("has the four expected levels", () => {
    expect(LogLevel.DEBUG).toBe("debug");
    expect(LogLevel.INFO).toBe("info");
    expect(LogLevel.WARN).toBe("warn");
    expect(LogLevel.ERROR).toBe("error");
  });
});
