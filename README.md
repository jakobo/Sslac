# Sslac: The somewhat backwards Class functionality added to JavaScript

"I now see my early attempts to support the classical model in JavaScript as a mistake." - Douglas Crockford

"Wow, let's do that again!" - Donkey from Shrek

What you're holding is a slick way to do prototypical classes in JavaScript. Sslac supports the usual class related functionality, plus a few extras. A lot of the code has been inspired by the libraries that came before it, in hopes it might inspire the libraries that come after it. With boldly sidestepping the pros/cons of this kind of object model, if this is what you're looking for, here it is. It's certainly easier than monkeying with object prototypes directly.

Sslac is MIT Licensed

What you're getting:

* Inheritance through object prototypes
* Automatic namespacing for complex deployments
* Support for mixing in static declarations onto instance objects
* Declaration for Functions (sugar)
* Runtime modification of methods

# Sslac Basics: Declaring Classes

Instance Classes:

    Sslac.Class("Your.Class").Extends("Extends.Object").Implements("Implements.Object")
    .Constructor(function Constructor(paramOne, paramTwo) {
      
    })
    .Method("methodName", function methodName(paramOne, paramTwo) {
      
    });
    // ...
    var foo = new Your.Class("one", "two");

* **.Class()** Declare a class. This is also the start of the chained methods...
* **.Extends()** (optional) Extend an existing class
* **.Implements()** (optional) Require this object implements a list of methods
* **.Constructor()** (optional) Declare a constructor for this object
* **.Method()** (optional) Add a method to the object's prototype

Static Classes:

    Sslac.Static("YourStatic.Class")
    .Static("staticMethod", functon staticMethod(paramOne, paramTwo) {
      
    });
    // ...
    YourStatic.Class.staticMethod("one", "two");

* **.Static()** Declare a static object. This also starts the chained methods...
* **.Static()** (optional) Adds a static method to the static object
* **.Implements()** (optional) Require this object implements a list of methods

Declaring Functions:

    Sslac.Function("YourFunction.In.A.Namespace", function funcName() {
    });
    // ...
    YourFunction.In.A.Namespace();

* **.Function()** Declare a function object. This does not chain.

Calling Parent Methods:

    // ...
    .Method("subClassMethod", function subClassMethod(paramOne) {
      this.Parent(paramOne);
    })
    // ...

* **this.Parent()** Call the parent method from within the subclassed method

# Sslac Advanced: Redefining Classes at Runtime

Get an existing method from a definition:

    var oldMethod = Sslac.definitionOf("Your.Namespaced.Object").getMethod("yourMethod");

Rewire:

    Sslac.definitionOf("Your.Namespaced.Object")
    .Method("yourMethod", function newYourMethod() {
      // optionally call the old method
      oldMethod.apply(this, arguments);
      // do your own custom code at runtime
    });

* **.definitionOf()** Get the definition of a Sslac Namespaced Item. Restarts the chaining (see Instance/Static Classes)
* **.getMethod()** Get the method of the specified name
* **.getStatic()** Get the method of the specified name
* **.getConstructor()** Get the constructor for the defined object

# Building Sslac on your own
You'll need:

* Node: https://github.com/joyent/node/wiki/Installation
* Node Package Manager: http://npmjs.org/

You'll then run:

* git clone git@github.com:Jakobo/Sslac.git
* cd Sslac
* make requires
* make

# Directory Guide

* **artifacts/** (built using make) contains minified versions of the code all shiny and compiled
* **config/** contains configs used in building such as the smoosh manifest
* **src/** contains the Sslac source
* **tests/** contains the Sslac source

# Additional Licenses
Sections of this code may include licenses that go beyond the MIT license. Those licenses may be found in the src/licenses directory.
