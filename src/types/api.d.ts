declare namespace Api {
  type ErrorReason = void;

  interface Error {
    success: false;
    message: string;
    reason?: ErrorReason;
    payload?: unknown;
  }

  interface Success<T> {
    success: true;
    payload: T;
  }
}
