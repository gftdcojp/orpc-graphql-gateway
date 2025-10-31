/**
 * @fileoverview resolver-delegateのテスト
 * 
 * @module internal/resolver-delegate.test
 */

import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import {
  createOrpcResolver,
  getProcedureFromRouter,
} from "./resolver-delegate.js";
import { OrpcRouter, OrpcProcedure } from "./types.js";

describe("createOrpcResolver", () => {
  it("should call procedure handler with parsed input", async () => {
    const handler = vi.fn(async ({ input }) => ({
      id: input.id,
      name: "Test",
    }));

    const procedure: OrpcProcedure = {
      input: z.object({ id: z.string() }),
      output: z.object({ id: z.string(), name: z.string() }),
      handler,
    };

    const resolver = createOrpcResolver(procedure, "getUser");
    const result = await resolver(null, { id: "123" }, {}, {} as any);

    expect(handler).toHaveBeenCalledWith({
      input: { id: "123" },
      ctx: {},
    });
    expect(result).toEqual({ id: "123", name: "Test" });
  });

  it("should validate input with Zod", async () => {
    const procedure: OrpcProcedure = {
      input: z.object({ id: z.string() }),
      output: z.object({ id: z.string() }),
      handler: async () => ({ id: "1" }),
    };

    const resolver = createOrpcResolver(procedure, "getUser");

    await expect(
      resolver(null, { id: 123 }, {}, {} as any),
    ).rejects.toThrow();
  });

  it("should validate output with Zod", async () => {
    const procedure: OrpcProcedure = {
      input: z.object({ id: z.string() }),
      output: z.object({ id: z.string() }),
      handler: async () => ({ invalid: "data" } as any),
    };

    const resolver = createOrpcResolver(procedure, "getUser");

    await expect(
      resolver(null, { id: "123" }, {}, {} as any),
    ).rejects.toThrow();
  });

  it("should handle Zod validation errors", async () => {
    const procedure: OrpcProcedure = {
      input: z.object({ id: z.string() }),
      output: z.object({ id: z.string() }),
      handler: async () => ({ id: "1" }),
    };

    const resolver = createOrpcResolver(procedure, "getUser");

    await expect(
      resolver(null, { invalid: "input" }, {}, {} as any),
    ).rejects.toThrow("Validation error in getUser");
  });

  it("should propagate non-Zod errors", async () => {
    const procedure: OrpcProcedure = {
      input: z.object({ id: z.string() }),
      output: z.object({ id: z.string() }),
      handler: async () => {
        throw new Error("Internal error");
      },
    };

    const resolver = createOrpcResolver(procedure, "getUser");

    await expect(
      resolver(null, { id: "123" }, {}, {} as any),
    ).rejects.toThrow("Internal error");
  });
});

describe("getProcedureFromRouter", () => {
  it("should get procedure from flat router", () => {
    const procedure: OrpcProcedure = {
      input: z.object({ id: z.string() }),
      output: z.object({ id: z.string() }),
      handler: async () => ({ id: "1" }),
    };

    const router: OrpcRouter = {
      procedures: {
        getUser: procedure,
      },
    };

    const result = getProcedureFromRouter(router, "getUser");
    expect(result).toBe(procedure);
  });

  it("should get procedure from nested router", () => {
    const procedure: OrpcProcedure = {
      input: z.object({ id: z.string() }),
      output: z.object({ id: z.string() }),
      handler: async () => ({ id: "1" }),
    };

    const router: OrpcRouter = {
      procedures: {
        user: {
          procedures: {
            get: procedure,
          },
        },
      },
    };

    const result = getProcedureFromRouter(router, "user_get");
    expect(result).toBe(procedure);
  });

  it("should return undefined for non-existent procedure", () => {
    const router: OrpcRouter = {
      procedures: {
        getUser: {
          input: z.object({ id: z.string() }),
          output: z.object({ id: z.string() }),
          handler: async () => ({ id: "1" }),
        },
      },
    };

    const result = getProcedureFromRouter(router, "nonExistent");
    expect(result).toBeUndefined();
  });

  it("should return undefined for router path", () => {
    const router: OrpcRouter = {
      procedures: {
        user: {
          procedures: {
            get: {
              input: z.object({ id: z.string() }),
              output: z.object({ id: z.string() }),
              handler: async () => ({ id: "1" }),
            },
          },
        },
      },
    };

    const result = getProcedureFromRouter(router, "user");
    expect(result).toBeUndefined();
  });

  it("should return undefined for empty router", () => {
    const router: OrpcRouter = {};

    const result = getProcedureFromRouter(router, "getUser");
    expect(result).toBeUndefined();
  });

  it("should return undefined when procedures is null", () => {
    const router: OrpcRouter = {
      procedures: null as any,
    };

    const result = getProcedureFromRouter(router, "getUser");
    expect(result).toBeUndefined();
  });

  it("should return undefined when current becomes non-object", () => {
    const router: OrpcRouter = {
      procedures: {
        user: "not-an-object" as any,
      },
    };

    const result = getProcedureFromRouter(router, "user_get");
    expect(result).toBeUndefined();
  });

  it("should return undefined when procedures is undefined in nested router", () => {
    const router: OrpcRouter = {
      procedures: {
        user: {
          procedures: undefined as any,
        },
      },
    };

    const result = getProcedureFromRouter(router, "user_get");
    expect(result).toBeUndefined();
  });
});
