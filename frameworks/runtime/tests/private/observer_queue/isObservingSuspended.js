// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

"import package core_test";
"import core"; 
"import private/observer_queue";
"import system/object";

var callCount, obj;

module("SC.Observers.isObservingSuspended", {
  setup: function() {
    callCount = 0;
    
    obj = SC.Object.create({ 
      foo: "bar",

      fooDidChange: function() { 
        callCount++; 
      }.observes('foo')
    });
  }
});

test("suspending observers stops notification", function() {
  SC.Observers.suspendPropertyObserving();
  SC.Observers.suspendPropertyObserving();
  obj.set("foo");
  equals(callCount, 0, 'should not notify observer while suspended');

  SC.Observers.resumePropertyObserving();
  equals(callCount, 0, 'should not notify observer while still suspended');
  
  SC.Observers.resumePropertyObserving();
  equals(callCount, 1, 'should notify observer when resumed');
  
});

// ..........................................................
// SPECIAL CASES
// 

// this test verifies a specific bug in the SC.Observing.propertyDidChange method.
test("suspended notifications should work when nesting property change groups", function() {
  
  SC.Observers.suspendPropertyObserving();
  obj.beginPropertyChanges();
  obj.set("foo");
  equals(callCount, 0, 'should not notify observer while suspended');

  obj.endPropertyChanges();
  equals(callCount, 0, 'should not notify observer while suspended');

  SC.Observers.resumePropertyObserving();
  equals(callCount, 1, 'should notify observer when resumed');
});

plan.run();