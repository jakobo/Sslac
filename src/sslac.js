/**
 * Sslac
 * http://www.github.com/jakobo/sslac
 * Copyright(c) 2011, Jakob Heuser jakob@felocity.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * Sslac - A "backwards" class library for JavaScript
 * Provides a consistent way to declare classes to ease 1st and 3rd
 * party development by using closures.
 * Features:
 * - auto extension: Objects can be set to extend by default, allowing for
 *   easy inheritance of this.* properties as well as prototyped methods
 * - consistent privileged interface: this.* assignments are handled by the
 *   framework.
 * - static and instance functionality: Can create both statuc and instance
 *   level objects
 * @class Sslac
 * @author Jakob Heuser <jheuser@linkedin.com>
 */
(function() {
var NAMESPACE = "Sslac";
var SslacRegistry = {};

window[NAMESPACE] = window[NAMESPACE] || {};

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
var extend = function(subc, superc, overrides) {
  var F = function() {};
  F.prototype = superc.prototype;
  subc.prototype = new F();
  subc.prototype.constructor = subc;
  subc.superclass = superc.prototype;
  if (superc.prototype.constructor == Object.prototype.constructor) {
    superc.prototype.constructor = superc;
  }
  if (overrides) {
    for (var i in overrides) {
      if (overrides.hasOwnProperty(overrides, i)) {
        subc.prototype[i]=overrides[i];
      }
    }
  }
};

/**
 * get the namespace object of a given ns
 * @param ns {String} namespace
 * @param root {Object} the root NS
 * @return {Object} the parent NS (for insertion)
 */
var namespaceOf = function(ns, root) {
  var i,
      piece,
      scope = root || window,
      pieces = ns.split(/\./),
      len = pieces.length;

  // loop through all pieces
  for (i = 0; i < len; i++) {
    piece = pieces[i];
    
    // if not a match, drill down one further
    if (i + 1 == len) {
      return scope;
    }

    scope[piece] = scope[piece] || {};
    scope = scope[piece];
  }
};

/**
 * Get the endpoint name of a namespace
 * for example: Foo.Bar.Baz => Baz
 * @param ns {String} the namespace
 * @param {String} the endpoint name
 */
var nameOf = function(ns) {
  var pieces = ns.split(/\./),
      last = pieces[pieces.length - 1];
  return last;
};

// The "root" of all evil. Really, just an object that gaurentees a base heirarchy
var Class = function() {
  this.Identifier = function() {
    return {
      name: "Sslac.ClassObject",
      ext: ""
    };
  };
};

/**
 * Root chaining object for Sslac. Takes a namespace and isStatic
 * this is the base object for construction of Sslac classes
 * @class ObjectRef
 */
var ObjectRef = function(ns) {
  var parent = null;
  var parentNS = "";
  var localConstructor = function() {};
  var privilegedMethods = {};
  
  var F = function() {
    var thisObj = this;
    this.Parents = [];
    
    // the reference to the Parent method
    // similar to $super() in prototype
    this.Parent = function() {
      var name = this.Parents[this.Parents.length - 1];
      
      var id = this.Identifier();
      var protoObj = namespaceOf(id.ext)[nameOf(id.ext)];
      
      var fn = (parent[name]) ? parent[name] :
               (protoObj.prototype && protoObj.prototype[name]) ? protoObj.prototype[name] : function(){};
               
      return fn.apply(thisObj, arguments);
    };
    
    privilegedMethods.Identifier = function() {
      return {
        name: ns,
        ext: parentNS
      };
    };
    
    // set overridden methods
    for (var name in privilegedMethods) {
      this[name] = buildMethod(name, thisObj);
    }
    
    this.Parents.push("constructor");
    var retVal = localConstructor.apply(this, arguments);
    this.Parents.pop();
    
    // restore overridden methods
    for (var name in privilegedMethods) {
      this[name] = buildMethod(name, thisObj);
    }
    
    return retVal;
  };
  
  var buildMethod = function(name, scope) {
    return function() {
      this.Parents.push(name);
      var retVal = privilegedMethods[name].apply(scope, arguments);
      this.Parents.pop();
      return retVal;
    };
  };
  
  var buildPrototype = function(name, fn) {
    return function() {
      this.Parents.push(name);
      var retVal = fn.apply(this, arguments);
      this.Parents.pop();
      return retVal;
    };
  };
  
  /**
   * defines a constructor
   * @method Constructor
   * @param {Function} the function to set
   * @return this
   */
  this.Constructor = function(fn) {
    localConstructor = fn;
    return this;
  };
  
  /**
   * get the constructor that has been defined
   * @method getConstructor
   * @return {Function}
   */
  this.getConstructor = function() {
    return localConstructor;
  };
  
  /**
   * defines a method (this.* syntax)
   * @method Final
   * @param name {String} the name to store
   * @param fn {Function} the function to set
   * @return this
   */
  this.Final = function(name, fn) {
    privilegedMethods[name] = fn;
    return this;
  };
  
  /**
   * get a final defined method (this.* syntax)
   * @method getFinal
   * @param name {String} the name of the method to get
   * @return {Function}
   */
  this.getFinal = function(name) {
    return privilegedMethods[name];
  };
  
  /**
   * Explicitly put something on the prototype
   * @method Method
   * @param name {String} the name to store
   * @param fn {Function} the function to set
   * @return this
   */
  this.Method = function(name, fn) {
    F.prototype[name] = buildPrototype(name, fn);
    return this;
  };
  
  /**
   * Get a method from the prototype
   * @method getMethod
   * @param name {String} the method to get
   * @return {Function}
   */
  this.getMethod = function(name) {
    return F.prototype[name];
  };
  
  /**
   * Explicitly put something on the static object
   * @method Static
   * @param name {String} the name to store
   * @param fn {Function} the function to set
   * @return this
   */
  this.Static = function(name, fn) {
    F[name] = fn;
    return this;
  };
  
  /**
   * Get something from the static object
   * @method getStatic
   * @param name {String} the method to get
   * @return {Function}
   */
  this.getStatic = function(name) {
    return F[name];
  };
  
  /**
   * define the superclass of this object
   * @method Extends
   * @param {String|Object} the object to extend
   * @return this
   */
  this.Extends = function(name) {
    var obj = name;
    if (typeof(name) == "string") {
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
   * @return {Object}
   */
  this.getExtends = function() {
    return parent;
  };
  
  // extend default class
  this.Extends(Class);
  
  var placeNS = namespaceOf(ns);
  var placeName = nameOf(ns);
  placeNS[placeName] = F;
};

// create object
var createObject = function(ns) {
  SslacRegistry[ns] = new ObjectRef(ns);
  return SslacRegistry[ns];
};

// create static object
var createStaticObject = function(ns) {
  SslacRegistry[ns] = new ObjectRef(ns);
  return SslacRegistry[ns];
};

// helper to create a function
var createFunction = function(ns, fn) {
  var placeNS = namespaceOf(ns);
  var placeName = nameOf(ns);
  placeNS[placeName] = fn;
};

// helper to just define a namespace
var defineNamespace = function(ns) {
  var placeNS = namespaceOf(ns);
  var placeName = nameOf(ns);
  placeNS[placeName] = placeNS[placeName] || {};
};

var resolveNamespace = function(ns, root) {
  return namespaceOf(ns, root)[nameOf(ns)];
};

var getDefinition = function(ns) {
  return SslacRegistry[ns];
};

// assign outward
window[NAMESPACE].Class = createObject;
window[NAMESPACE].Static = createStaticObject;
window[NAMESPACE].Function = createFunction;
window[NAMESPACE].Define = defineNamespace;
window[NAMESPACE].ClassObject = Class;
window[NAMESPACE].namespaceOf = namespaceOf;
window[NAMESPACE].nameOf = nameOf;
window[NAMESPACE].valueOf = resolveNamespace;
window[NAMESPACE].definitionOf = getDefinition;

})();

// licensing block
// extend()
/*
Copyright (c) 2010, Yahoo! Inc.
All rights reserved.
Redistribution and use of this software in source and binary forms, with or
without modification, are permitted provided that the following conditions are
met:

* Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
this list of conditions and the following disclaimer in the documentation
and/or other materials provided with the distribution.

* Neither the name of Yahoo! Inc. nor the names of its contributors may be used
to endorse or promote products derived from this software without specific prior
written permission of Yahoo! Inc.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
