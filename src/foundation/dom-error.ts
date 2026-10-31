/**
 * The error a rejected API call carries: a `DOMException` with `name` and `message`, or, where
 * `DOMException` cannot be constructed, an `Error` with that `message` whose `name` is `name`.
 */
export function domError(name: string, message: string): Error {
  try {
    return new DOMException(message, name);
  } catch {
    const error = new Error(message);
    error.name = name;
    return error;
  }
}

/** The message of a thrown `Error`, or the thrown value as text. */
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
