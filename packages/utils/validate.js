const type = obj => Object.prototype.toString.call(obj).replace(/\[object\s|\]/g, ''),
  isFunction = func => type(func) === 'Function',
  isArray = list => type(list) === 'Array',
  /**
   * 是否是对象
   * @param {*} obj
   */
  isObject = obj => type(obj) === 'Object',
  /**
   * 是否是字符串
   * @param {*} obj
   */
  isString = obj => type(obj) === 'String',
  /**
   * 是否为null
   * @param {String} str
   */
  isNull = str => str == undefined || str == '' || str == null,
  /**
   * 对象是否为空
   * @param {*} obj
   */
  objectIsNull = obj => JSON.stringify(obj) === '{}';

export { type, isFunction, isArray, isNull, objectIsNull, isObject, isString };
