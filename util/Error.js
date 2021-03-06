var oo = require('./oo');

/**
  Custom error object for all Substance related errors

  @example
  
  ```js
  var Err = require('substance/util/Error');
  throw new Err('Document.SelectionUpdateError', {message: 'Could not update selection.'});
  ```

  For better inspection allows you to pass a cause (the error that caused the error).
  That way we can attach context information on each level and we can also ensure
  security, by not passing the cause-chain to the client.

  Resources:
    http://www.bennadel.com/blog/2828-creating-custom-error-objects-in-node-js-with-error-capturestacktrace.htm
    https://gist.github.com/justmoon/15511f92e5216fa2624b
    https://github.com/davepacheco/node-verror/blob/master/lib/verror.js
*/
function SubstanceError(name, options) {
  this.name = name;
  this.message = options.message;
  this.info = options.info;
  this.errorCode = options.errorCode;
  this.cause = options.cause;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, (SubstanceError));  
  }
}

SubstanceError.Prototype = function() {
  this.inspect = function() {
    var parts = [];

    // This gives us a full node.js error including error name + message + stack trace
    parts.push(this.stack);

    // We just print additional info here
    if (this.info) {
      parts.push(this.info + '. ');
    }

    // We also print the cause in the same way
    if (this.cause) {
      parts.push('\nCaused by: ');

      if (this.cause.inspect) {
        // If cause is again a Substance error
        parts.push(this.cause.inspect());  
      } else {
        // If not we just use Error.toString
        parts.push(this.cause.toString());  
      }
    }

    return parts.join('');
  };
};

oo.initClass(Error);

Error.extend(SubstanceError);

module.exports = SubstanceError;