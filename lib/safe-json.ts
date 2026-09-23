// Global circular-safe JSON.stringify & error sanitizer

export function safeJsonStringify(value: any, space?: number | string): string {
  const seen = new WeakSet();
  const circularReplacer = (key: string, val: any) => {
    if (typeof val === 'object' && val !== null) {
      if (seen.has(val)) {
        return '[Circular]';
      }
      seen.add(val);
    }
    return val;
  };

  try {
    return JSON.stringify(value, circularReplacer, space);
  } catch {
    try {
      // Fallback for custom objects or weird getters
      return JSON.stringify(
        value,
        (_k, v) => (typeof v === 'object' && v !== null ? (seen.has(v) ? '[Circular]' : (seen.add(v), v)) : v),
        space
      );
    } catch {
      return '"[Unserializable Object]"';
    }
  }
}

// Client-side initialization to patch JSON.stringify globally
if (typeof window !== 'undefined') {
  try {
    const origStringify = JSON.stringify;
    JSON.stringify = function (value: any, replacer?: any, space?: any) {
      const seen = new WeakSet();
      const circularReplacer = (key: string, val: any) => {
        if (typeof val === 'object' && val !== null) {
          if (seen.has(val)) {
            return '[Circular]';
          }
          seen.add(val);
        }
        if (typeof replacer === 'function') {
          return replacer(key, val);
        }
        return val;
      };

      try {
        return origStringify(
          value,
          replacer && typeof replacer !== 'function' ? replacer : circularReplacer,
          space
        );
      } catch (e: any) {
        // Specifically catches: Converting circular structure to JSON
        try {
          return origStringify(value, circularReplacer, space);
        } catch {
          return '"[Unserializable Object]"';
        }
      }
    };
  } catch {
    // Ignore if JSON.stringify is not configurable
  }
}
