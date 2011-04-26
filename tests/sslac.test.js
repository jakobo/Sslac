var Sslac = require("../src/sslac.js");

// nodejs harness
if (module) {
  module = QUnit.module;
}

////////////////////////////////////////////////////////////////////////////////
// FRAMING
////////////////////////////////////////////////////////////////////////////////

// objects used in this test collection
Sslac.Class("SslacTest.BasicNamespacedObject")
.Constructor(function Constructor(input) {
  this.input = input;
})
.Method("output", function output() {
  return this.input;
});

Sslac.Class("SslacTest.BasicExtensionObject").Extends("SslacTest.BasicNamespacedObject")
.Constructor(function Constructor(input) {
  this.Parent(input);
})
.Method("extendOutput", function extendOutput() {
  return this.input;
});

Sslac.Class("SslacTest.ChainedExtensionObject").Extends("SslacTest.BasicNamespacedObject")
.Constructor(function Constructor(input, alsoInput) {
  this.Parent(input);
  this.alsoInput = alsoInput;
})
.Method("output", function output() {
  return this.Parent() + this.alsoInput;
});

////////////////////////////////////////////////////////////////////////////////
// TESTS
////////////////////////////////////////////////////////////////////////////////

module("Namespacing");

test("Namespace Set and Retrieve", function() {
  var testName = "SslacTest.NS.A";
  Sslac.Define(testName);
  
  ok(typeof SslacTest.NS.A == "object", "defines successfully");
  ok(Sslac.nameOf(testName) == "A", "nameOf gets last item in chain");
  strictEqual(Sslac.namespaceOf(testName), SslacTest.NS, "namespaceOf retrieves parent NS object");
  strictEqual(Sslac.valueOf(testName), SslacTest.NS.A, "valueOf returns object at given NS");
});

////////////////////////////////////////////////////////////////////////////////

module("Definition Management");

test("getDefinition", function() {
  var testName = "SslacTest.DefinitionObject",
      def = Sslac.Class(testName);
  strictEqual(Sslac.definitionOf(testName), def, "definitionOf returns Sslac definition object");
});

////////////////////////////////////////////////////////////////////////////////

module("Instance Class", {
  setup: function() {
    this.seedValue = 7;
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
    this.seedValue = 9;
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
    this.seedValue = 5;
    this.seedValueTwo = 7;
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

