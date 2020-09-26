'use strict'

function errorMessage (message, err) {
  return `Error ${message}: ${err.message || err}`
}

module.exports = {
  errorMessage: errorMessage,
  /**
   * Prepends the error message with the given `message`.
   *
   * Designed to be used in a `Promise`'s `catch` method. For example:
   *
   * ```javascript
   * Promise.reject(new Error('My error')).catch(wrapError('with the code'))
   * ```
   *
   * The `wrappedFunction` parameter is used for async/await use cases. For example:
   *
   * ```javascript
   * wrapError('with the code', async () => {
   *   await foo();
   *   await bar();
   * })
   * ```
   */
  wrapError: function wrapError (message, wrappedFunction) {
    if (wrappedFunction) {
      try {
        return wrappedFunction()
      } catch (error) {
        module.exports.wrapError(message)(error)
      }
    } else {
      return err => {
        err.message = errorMessage(message, err)
        throw err
      }
    }
  }
}
