/**
 * Optional Result/Either pattern for functional error handling
 * Alternative to try-catch when you want explicit error handling
 */

/**
 * Success result
 */
export interface Ok<T> {
  ok: true
  value: T
}

/**
 * Error result
 */
export interface Err<E> {
  ok: false
  error: E
}

/**
 * Result type - either Ok or Err
 */
export type Result<T, E = Error> = Ok<T> | Err<E>

/**
 * Create a successful result
 */
export const ok = <T>(value: T): Ok<T> => ({ ok: true, value })

/**
 * Create an error result
 */
export const err = <E>(error: E): Err<E> => ({ ok: false, error })

/**
 * Check if result is Ok
 */
export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result.ok === true

/**
 * Check if result is Err
 */
export const isErr = <T, E>(result: Result<T, E>): result is Err<E> => result.ok === false

/**
 * Unwrap result value or throw error
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (result.ok) {
    return result.value
  }
  throw result.error
}

/**
 * Unwrap result value or return default
 */
export const unwrapOr = <T, E>(result: Result<T, E>, defaultValue: T): T => {
  return result.ok ? result.value : defaultValue
}

/**
 * Map result value if Ok
 */
export const map = <T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> => {
  return result.ok ? ok(fn(result.value)) : result
}

/**
 * Chain result transformations
 */
export const flatMap = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> => {
  return result.ok ? fn(result.value) : result
}
