var Sslac = require("../src/sslac.js");

// nodejs harness
if (module) {
  module = QUnit.module;
}

////////////////////////////////////////////////////////////////////////////////
// FRAMING
////////////////////////////////////////////////////////////////////////////////

var INTERFACE_TEST      = ["foo", "bar", "baz", "quux"],
    GENERIC_NAMESPACE   = "SslacTest.NS.A",
    GENERIC_DEFINITION  = "SslacTest.DefinitionObject",
    SEED_VALUE_ONE      = 3,
    SEED_VALUE_TWO      = 5,
    SEED_VALUE_THREE    = 7,
    SEED_VALUE_FOUR     = 9;

// basic namespaced object
Sslac.Class("SslacTest.BasicNamespacedObject")
.Constructor(function Constructor(input) {
  this.input = input;
})
.Method("output", function output() {
  return this.input;
});

// basic extension object
Sslac.Class("SslacTest.BasicExtensionObject").Extends("SslacTest.BasicNamespacedObject")
.Constructor(function Constructor(input) {
  this.Parent(input);
})
.Method("extendOutput", function extendOutput() {
  return this.input;
});

// an extension object relying on this.Parent
Sslac.Class("SslacTest.ChainedExtensionObject").Extends("SslacTest.BasicNamespacedObject")
.Constructor(function Constructor(input, alsoInput) {
  this.Parent(input);
  this.alsoInput = alsoInput;
})
.Method("output", function output() {
  return this.Parent() + this.alsoInput;
});

// a static object
Sslac.Static("SslacTest.BasicStaticObject")
.Static("staticMethod", function staticMethod(input) {
  return input;
});

Sslac.Class("SslacTest.BasicImplementsObject").Implements(INTERFACE_TEST)
.Method("foo", function foo() {});

Sslac.Class("SslacTest.BasicImplementsExtendsObject")
.Extends("SslacTest.BasicImplementsObject")
.Implements(INTERFACE_TEST);

Sslac.Class("SslacTest.RedefinableObject")
.Method("foo", function foo() {
  return SEED_VALUE_ONE;
});

////////////////////////////////////////////////////////////////////////////////
// TESTS
////////////////////////////////////////////////////////////////////////////////

module("Namespacing");

test("Namespace Set and Retrieve", function() {
  Sslac.Define(GENERIC_NAMESPACE);
  
  ok(typeof SslacTest.NS.A == "object", "defines successfully");
  ok(Sslac.nameOf(GENERIC_NAMESPACE) == "A", "nameOf gets last item in chain");
  strictEqual(Sslac.namespaceOf(GENERIC_NAMESPACE), SslacTest.NS, "namespaceOf retrieves parent NS object");
  strictEqual(Sslac.valueOf(GENERIC_NAMESPACE), SslacTest.NS.A, "valueOf returns object at given NS");
});

////////////////////////////////////////////////////////////////////////////////

module("Definition Management");

test("getDefinition", function() {
  var def = Sslac.Class(GENERIC_DEFINITION);
  strictEqual(Sslac.definitionOf(GENERIC_DEFINITION), def, "definitionOf returns Sslac definition object");
});

////////////////////////////////////////////////////////////////////////////////

module("Instance Class", {
  setup: function() {
    this.seedValue = SEED_VALUE_ONE;
    this.baseObject = new SslacTest.BasicNamespacedObject(this.seedValue);
  },
  teardown: function() {
    delete this.baseObject;
  }
});

test("Type Checks", function() {
  ok(typeof this.baseObject == "object", "Objects created by Sslac are objects");
  ok(this.baseObject instanceof Sslac.ClassObject, "Objects created by Sslac inherit from base class");
});

test("Constructor Tests", function() {
  strictEqual(this.baseObject.output(), this.seedValue, "Values stored in Constructor are accessible");
});

////////////////////////////////////////////////////////////////////////////////

module("Inherited Class", {
  setup: function() {
    this.seedValue = SEED_VALUE_ONE;
    this.extendObject = new SslacTest.BasicExtensionObject(this.seedValue);
  },
  teardown: function() {
    delete this.extendObject;
  }
});

test("Type Checks", function() {
  ok(typeof this.extendObject == "object", "Extended object is still an object");
  ok(this.extendObject instanceof Sslac.ClassObject, "Extended object is still a base Sslac object");
  ok(this.extendObject instanceof SslacTest.BasicNamespacedObject, "Extended object an instance of object it extends");
});

test("Parent Methods", function() {
  strictEqual(this.extendObject.output(), this.seedValue, "Values stored in Constructor are accessible");
});

test("New Methods", function() {
  strictEqual(this.extendObject.extendOutput(), this.seedValue, "Values stored in Constructor are accessible");
});

////////////////////////////////////////////////////////////////////////////////

module("Inherited & Chained Class", {
  setup: function() {
    this.seedValue = SEED_VALUE_ONE;
    this.seedValueTwo = SEED_VALUE_TWO;
    this.extendObject = new SslacTest.ChainedExtensionObject(this.seedValue, this.seedValueTwo);
  },
  teardown: function() {
    delete this.extendObject;
  }
});

test("Type Checks", function() {
  ok(typeof this.extendObject == "object", "Extended object is still an object");
  ok(this.extendObject instanceof Sslac.ClassObject, "Extended object is still a base Sslac object");
  ok(this.extendObject instanceof SslacTest.BasicNamespacedObject, "Extended object an instance of object it extends");
});

test("Parent Chaining", function() {
  strictEqual(this.extendObject.output(), this.seedValue + this.seedValueTwo, "output chained to this.Parent");
});

////////////////////////////////////////////////////////////////////////////////

module("Static Class");

test("Type Checks", function() {
  ok(typeof SslacTest.BasicStaticObject == "object", "Static object is still an object");
});

test("Invocation", function() {
  strictEqual(SslacTest.BasicStaticObject.staticMethod(SEED_VALUE_ONE), SEED_VALUE_ONE, "static invocation");
});

////////////////////////////////////////////////////////////////////////////////

module("Interfaces", {
  setup: function() {
    this.ifaceObj = new SslacTest.BasicImplementsObject();
    this.extIfaceObj = new SslacTest.BasicImplementsExtendsObject();
  },
  teardown: function() {
    delete this.ifaceObj;
    delete this.extIfaceObj;
  }
});

test("Interface Defined", function() {
  expect(INTERFACE_TEST.length);
  for (var i = 0, len = INTERFACE_TEST.length; i < len; i++) {
    ok(typeof this.ifaceObj[INTERFACE_TEST[i]] === "function", INTERFACE_TEST[i]+" is a function");
  }
});

test("Error on Non Defined Method", function() {
  expect(INTERFACE_TEST.length - 1);
  for (var i = 0, len = INTERFACE_TEST.length; i < len; i++) {
    try {
      this.ifaceObj[INTERFACE_TEST[i]]();
    }
    catch(e) {
      ok(true, "Caught undefined "+INTERFACE_TEST[i]);
    }
  }
});

test("Extended Objects inherit defined methods", function() {
  // foo should work
  expect(1);
  try {
    this.extIfaceObj.foo();
    ok(true, "foo is valid");
  }
  catch(e) {}
});


