'use strict';

/*
 * Lots of things get wrapped in output(...args)
 * This function basically just makes sure the right stuffs
 * gets output
 */
module.exports = function output(obj, ...args) {
  if (!obj) {
    // return empty string for undefined objects
    return '';
  } else if (Array.isArray(obj)) {
    // recurse into arrays
    return obj.map((obj) => output(obj, ...args)).join('') || '';
  } else if (obj.prototype && obj.prototype.render) {
    // should be a Component instance, create a new instance and return the
    // result of render
    const instance = new obj(Object.assign({}, args[0], { children: args.slice(1) }));
    return instance.render(instance.props, instance.state) || '';
  } else if (typeof obj === 'function') {
    // a dumb / stateless component... simply call it
    return obj(Object.assign({}, args[0], { children: args.slice(1) }));
  }

  return obj;
};
