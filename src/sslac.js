/*global module: true, ObjectRef: true */

(function () {
  
  /**
   * Sslac - A "backwards" class library for JavaScript
   * Provides a consistent way to declare classes to ease 1st and 3rd
   * party development by using closures.
   * Features:
   * - auto extension: Objects can be set to extend by default, allowing for
   *   easy inheritance of this.* properties as well as prototyped methods
   * - static and instance functionality: Can create both static and instance
   *   level objects
   * - monkeypatching: objects can be modified on the fly to ease code upgrade paths
   * @class Sslac
   * @static
   * @author Jakob Heuser <jheuser@linkedin.com>
   */
  
  var globalWindow = this,
      NAMESPACE = "Sslac",
      SslacRegistry = {},
      externalInterface = null,
      oldSslac = globalWindow[NAMESPACE];

  globalWindow[NAMESPACE] = globalWindow[NAMESPACE] || {};
  externalInterface = globalWindow[NAMESPACE];

  /**
   * extend an object and assign parent to .superclass
   * @license BSD
   * @author YUI
   * @private
   * @method extend
   * @param subc {Object} the subclass object
   * @param superc {Object} the superclass object
   * @param overrides {Object} any methods / properties to apply after extending
   */
  function extend(subc, superc, overrides) {
    var F = function () {};
    F.prototype = superc.prototype;
    subc.prototype = new F();
    subc.prototype.constructor = subc;
    subc.superclass = superc.prototype;
    if (superc.prototype.constructor === Object.prototype.constructor) {
      superc.prototype.constructor = superc;
    }
    if (overrides) {
      for (var i in overrides) {
        if (overrides.hasOwnProperty(overrides, i)) {
          subc.prototype[i] = overrides[i];
        }
      }
    }
  }

  /**
   * @method namespaceOf
   * @private
   * @for Sslac
   * @see namespaceOf
   */
  function namespaceOf(ns, root) {
    var i,
        piece,
        scope = root || globalWindow,
        pieces = ns.split(/\./),
        len = pieces.length;

    // loop through all pieces
    for (i = 0; i < len; i++) {
      piece = pieces[i];
  
      // if not a match, drill down one further
      if (i + 1 === len) {
        return scope;
      }

      scope[piece] = scope[piece] || {};
      scope = scope[piece];
    }
  }

  /**
   * @method nameOf
   * @private
   * @for Sslac
   * @see nameOf
   */
  function nameOf(ns) {
    var pieces = ns.split(/\./),
        last = pieces[pieces.length - 1];
    return last;
  }
  
  /**
   * @method createObject
   * @private
   * @for Sslac
   * @see Class
   */
  function createObject(ns) {
    SslacRegistry[ns] = new ObjectRef(ns);
    return SslacRegistry[ns];
  }
  
  /**
   * @method createStatic
   * @private
   * @for Sslac
   * @see Class
   */
  function createStatic(ns) {
    SslacRegistry[ns] = new ObjectRef(ns, true);
    return SslacRegistry[ns];
  }

  /**
   * @method createFunction
   * @private
   * @for Sslac
   * @see Function
   */
  function createFunction(ns, fn) {
    var placeNS = namespaceOf(ns);
    var placeName = nameOf(ns);
    placeNS[placeName] = fn;
  }

  /**
   * @method defineNamespace
   * @private
   * @for Sslac
   * @see Define
   */
  function defineNamespace(ns) {
    var placeNS = namespaceOf(ns);
    var placeName = nameOf(ns);
    placeNS[placeName] = placeNS[placeName] || {};
  }
  
  /**
   * @method resolveNamespace
   * @private
   * @for Sslac
   * @see valueOf
   */
  function resolveNamespace(ns, root) {
    return namespaceOf(ns, root)[nameOf(ns)];
  }

  /**
   * @method getDefinition
   * @private
   * @for Sslac
   * @see definitionOf
   */
  function getDefinition(ns) {
    return SslacRegistry[ns];
  }
  
  /**
   * @method noConflict
   * @private
   * @for Sslac
   * @see noConflict
   */
  function noConflict() {
    var thisSslac = externalInterface;
    globalWindow[NAMESPACE] = oldSslac;
    return thisSslac;
  }

  /**
   * The root object from which all others will inherit
   * @class Class
   * @for Sslac
   * @constructor
   */
  function Class() {
    this.Identifier = function () {
      return {
        name: "Sslac.ClassObject",
        ext: ""
      };
    };
  }

  /**
   * Root chaining object for Sslac. Takes a namespace and isStatic
   * this is the base object for construction of Sslac classes
   * @class ObjectRef
   * @consructor
   * @for Sslac
   */
  function ObjectRef(ns, isStatic) {
    var parent = null,
        parentNS = "",
        localConstructor = function () {},
        privilegedMethods = {},
        placeNS = namespaceOf(ns),
        staticObj = {};
        
    /**
     * Builds privlieged methods
     * @for ObjectRef
     * @method buildMethod
     * @private
     * @param name {String} the name of the method
     * @param scope {Object} a scope for the method to run in
     * @return {Object} the return value from the named method
     */
    function buildMethod(name, scope) {
      return function () {
        this.Parents.push(name);
        var retVal = privilegedMethods[name].apply(scope, arguments);
        this.Parents.pop();
        return retVal;
      };
    }

    /**
     * Builds prototype methods
     * @for ObjectRef
     * @method buildPrototype
     * @private
     * @param name {String} the name of the method
     * @param fn {Function} a function to run in ObjectRef's scope
     * @return {Object} the return value from the function
     */
    function buildPrototype(name, fn) {
      return function () {
        this.Parents.push(name);
        var retVal = fn.apply(this, arguments);
        this.Parents.pop();
        return retVal;
      };
    }

    /**
     * The internally constructed object for ObjectRef
     * This is what the end user interfaces with
     * @class F
     * @for ObjectRef
     * @constructor
     */
    function F() {
      var thisObj = this,
          name = null,
          retVal = null;
          
      this.Parents = [];
  
      /**
       * Invokes the parent method off the prototype chain
       * @method Parent
       * @param {Object} takes an overloaded number of arguments
       * @return {Object} the return value from the parent method
       */
      this.Parent = function () {
        var name = this.Parents[this.Parents.length - 1],
            id = this.Identifier(),
            protoObj = namespaceOf(id.ext)[nameOf(id.ext)],
            fn = (parent[name]) ? parent[name] :
                 (protoObj.prototype && protoObj.prototype[name]) ? protoObj.prototype[name] : function () {};
             
        return fn.apply(thisObj, arguments);
      };
  
      privilegedMethods.Identifier = function () {
        return {
          name: ns,
          ext: parentNS
        };
      };
  
      // set overridden methods
      for (name in privilegedMethods) {
        if (privilegedMethods.hasOwnProperty(name)) {
          this[name] = buildMethod(name, thisObj);
        }
      }
  
      this.Parents.push("constructor");
      retVal = localConstructor.apply(this, arguments);
      this.Parents.pop();
  
      // restore overridden methods
      for (name in privilegedMethods) {
        if (privilegedMethods.hasOwnProperty(name)) {
          this[name] = buildMethod(name, thisObj);
        }
      }
  
      return retVal;
    }
    
    /**
     * implements a collection of methods
     * @method Implements
     * @for F
     * @param {Array <String>} the interface to implement
     * @return this
     */
    this.Implements = function () {
      var thisModule = this;
      
      function createImplementsMethod(name) {
        return function() {
          throw new Error("The interface defined requires "+name);
        };
      }
      
      for (var i = 0, len = arguments.length; i < len; i++) {
        // isArray
        if (Object.prototype.toString.call(arguments[i]).slice(8, -1).toLowerCase() === "array") {
          for (var j = 0, j_len = arguments[i].length; j < j_len; j++) {
            thisModule.Implements(arguments[i][j]);
          }
        }
        else {
          // does it contain a "."? If so, this is a namespaced item to resolve
          if (arguments[i].indexOf(".") >= 0) {
            thisModule.Implements(resolveNamespace(arguments[i]));
          }
          else {
            if (!this.getMethod(arguments[i])) {
              this.Method(arguments[i], createImplementsMethod(arguments[i]));
            }
          }
        }
      }
      
      return this;
    };

    /**
     * defines a constructor
     * @method Constructor
     * @for F
     * @param {Function} the function to set
     * @return this
     */
    this.Constructor = function (fn) {
      localConstructor = fn;
      return this;
    };

    /**
     * get the constructor that has been defined
     * @method getConstructor
     * @for F
     * @return {Function}
     */
    this.getConstructor = function () {
      return localConstructor;
    };

    /**
     * Explicitly put something on the prototype
     * @method Method
     * @for F
     * @param name {String} the name to store
     * @param fn {Function} the function to set
     * @return this
     */
    this.Method = function (name, fn) {
      F.prototype[name] = buildPrototype(name, fn);
      return this;
    };

    /**
     * Get a method from the prototype
     * @method getMethod
     * @for F
     * @param name {String} the method to get
     * @return {Function}
     */
    this.getMethod = function (name) {
      return F.prototype[name];
    };

    /**
     * Explicitly put something on the static object
     * @method Static
     * @for F
     * @param name {String} the name to store
     * @param fn {Function} the function to set
     * @return this
     */
    this.Static = function (name, fn) {
      F[name] = fn;
      staticObj[name] = fn;
      return this;
    };

    /**
     * Get something from the static object
     * @method getStatic
     * @for F
     * @param name {String} the method to get
     * @return {Function}
     */
    this.getStatic = function (name) {
      return F[name];
    };

    /**
     * define the superclass of this object
     * @method Extends
     * @for F
     * @param {String|Object} the object to extend
     * @return this
     */
    this.Extends = function (name) {
      var obj = name;
      if (typeof name === "string") {
        obj = namespaceOf(name)[nameOf(name)];
        parentNS = name;
      }
      extend(F, obj);
      parent = F.superclass;
      return this;
    };

    /**
     * Get the object this object extends
     * @method getExtends
     * @for F
     * @return {Object}
     */
    this.getExtends = function () {
      return parent;
    };

    // extend default class
    this.Extends(Class);

    if (isStatic) {
      placeNS[nameOf(ns)] = staticObj;
    }
    else {
      placeNS[nameOf(ns)] = F;
    }
  }

  // assign outward
  
  // class object for comparisons
  externalInterface.ClassObject = Class;
  
  /**
   * Turns ObjectRef into F by instantiating the ObjectRef
   * @method Class
   * @for Sslac
   * @see createObject
   * @param ns {String} the namespace to store the new object into
   * @return {Object} the created object reference
   */
  externalInterface.Class = createObject;
  
  /**
   * Turns ObjectRef into F by instantiating the ObjectRef
   * @method Static
   * @for Sslac
   * @see createStatic
   * @param ns {String} the namespace to store the new object into
   * @return {Object} the created object reference
   */
  externalInterface.Static = createStatic;
  
  /**
   * Creates a function
   * @method Function
   * @for Sslac
   * @see createFunction
   * @param ns {String} the namespace to store the function in
   * @param fn {Function} the function to store
   * @return {Object} the created object reference
   */
  externalInterface.Function = createFunction;
  
  /**
   * Ensures a given namespace is defined
   * @method Define
   * @for Sslac
   * @see defineNamespace
   * @param ns {String} the namespace to define
   */
  externalInterface.Define = defineNamespace;
  
  /**
   * get the namespace object of a given ns
   * @method namespaceOf
   * @for Sslac
   * @see namespaceOf
   * @param ns {String} namespace
   * @param root {Object} the root NS
   * @return {Object} the parent NS (for insertion)
   */
  externalInterface.namespaceOf = namespaceOf;
  
  /**
   * Get the endpoint name of a namespace
   * for example: Foo.Bar.Baz => Baz
   * @method nameOf
   * @for Sslac
   * @see nameOf
   * @param ns {String} the namespace
   * @param {String} the endpoint name
   */
  externalInterface.nameOf = nameOf;
  
  /**
   * Return the value at a given namespace within a provided root object
   * @method valueOf
   * @for Sslac
   * @see resolveNamespace
   * @param ns {String} the namespace to find
   * @param root {Object} the root namespace to check, for example, "window"
   */
  externalInterface.valueOf = resolveNamespace;
  
  /**
   * Gets the definition object at a given namespace
   * @method definitionOf
   * @for Sslac
   * @see getDefinition
   * @param ns {String} the namespace to return
   * @return {Object} the value at ns
   */
  externalInterface.definitionOf = getDefinition;
  
  /**
   * Allows multiple Sslac instances to coexist
   * @method noConflict
   * @for Sslac
   * @see noConflict
   * @return {Object} this Sslac object
   */
  externalInterface.noConflict = noConflict;
  
  // Common JS Modules 1.1 Compliance
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = externalInterface.noConflict();
  }
}());
