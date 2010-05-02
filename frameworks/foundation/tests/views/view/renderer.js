// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */
var testRenderer, rendererView, renderView, replacingRenderView, renderSkipUpdateView, expected_theme;

module("SC.View#renderer", {
  setup: function() {
    testRenderer = SC.Renderer.extend({
      render: function(context) {
        this.didRender = YES;
        context.attr("alt", "test");
        context.push("<a class='test'>Hello</a>");
      },
      update: function() {
        this.didUpdate = YES;
        this.$().attr("title", "test");
        this.$(".test").text("Hi");
      },
      didAttachLayer: function(layer) {
        this.layerWasAttached = YES;
        this.layerAttached = layer;
      }
    }).create();
    expected_theme = SC.Theme.find("sc-test");
    
    rendererView = SC.View.extend({
      theme: "sc-test",

      // the create renderer test
      createRenderer: function(theme) {
        this.createRendererWasCalled = YES;
        equals(theme, expected_theme, "the correct theme was passed");

        this.rendererInstance = testRenderer();
        return this.rendererInstance;
      },

      updateRenderer: function(r) {
        this.updateRendererWasCalled = YES;
        equals(r, this.rendererInstance, "Renderer should be the one we created");
      }
    });
    
    renderView = SC.View.extend({
      render: function(context, firstTime) {
        if (firstTime) {
          context.push("<a class='test'>Hello</a>");
        } else {
          context.attr("title", "test");
          this.$(".test").text("Hi");
        }
      }
    });
    
    renderSkipUpdateView = SC.View.extend({
      render: function(context, firstTime) {
        if (firstTime) {
          context.push("<a class='test'>Hello</a>");
        }
      }
    });
    
    replacingRenderView = SC.View.extend({
      render: function(context, firstTime) {
        if (firstTime) {
          context.push("<a class='test'>Hello</a>");
        } else {
          context.push("<a class='test'>Hi</a>");
          context.attr("title", "test");
        }
      }
    });
  },
  
  teardown: function() {
    testRenderer = null; // avoid memory leaks
  }
});

// themes may not be loaded in foundation, but we still need to test
SC.Theme.register("sc-test", SC.Theme.extend({}));

test("calling createLayer calls createRenderer and updateRenderer when createRenderer is present", function() {
  var view = rendererView.create();
  view.createLayer();
  ok(view.createRendererWasCalled, "createRenderer was called.");
  ok(view.updateRendererWasCalled, "updateRenderer was called.");
});

test("check that even if renderFirst, createLayer/updateLayer are called.", function() {
  // a renderFirsView
  var renderFirstView = rendererView.extend({
    render: function(context, firstTime){
    }
  });
  
  var view = renderFirstView.create();
  view.createLayer();
  
  ok(view.createRendererWasCalled, "createRenderer was called.");
  ok(view.updateRendererWasCalled, "updateRenderer was called.");
});

test("calling createLayer and updateLayer on renderFirst views trigger render and renderer in proper order.", function() {
  // a renderFirsView
  var renderFirstView = rendererView.extend({
    render: function(context, firstTime){
      if (firstTime) {
        this.renderFirstTimeWasCalled = YES;
        ok(!this.rendererInstance.didRender, "Did not use renderer to render yet.");
        ok(!this.rendererInstance.didUpdate, "Definitely did not update using renderer yet.");
        sc_super();
        ok(this.rendererInstance.didRender, "Now, should have rendered...");
        ok(!this.rendererInstance.didUpdate, "But, should not have updated.");
      } else {
        this.renderNotFirstTimeWasCalled = YES;
        ok(this.rendererInstance.didRender, "Should have used renderer to render...");
        ok(!this.rendererInstance.didUpdate, "... but not to update.");
        sc_super();
        ok(this.rendererInstance.didUpdate, "By now it should have updated..");
      }
    }
  });
  
  var view = renderFirstView.create();
  view.createLayer();
  
  // check that it was render first time, not the other way
  ok(view.renderFirstTimeWasCalled, "Called firstTime.");
  ok(!view.renderNotFirstTimeWasCalled, "Did not called non-firstTime.");
  
  // update
  view.updateLayer();
  
  // check that it was render first time, not the other way
  ok(view.renderNotFirstTimeWasCalled, "Did not called non-firstTime.");
});

test("calling createLayer and updateLayer on renderer-based views render and update properly.", function() {
  var view = rendererView.create();
  view.createLayer();
  ok(view.$(".test").length > 0, "Created test element");
  equals(view.$(".test").text(), "Hello", "Test element text is");
  
  view.updateLayer();
  ok(view.$(".test").length > 0, "Test element is still present");
  equals(view.$(".test").text(), "Hi", "Test element text has changed to ");
  equals(view.$().attr("title"), "test", "Test element has a title of ");
});

test("calling createLayer and updateLayer on render-only views render and update properly.", function() {
  var view = renderView.create();
  view.createLayer();
  ok(view.$(".test").length > 0, "Created test element");
  equals(view.$(".test").text(), "Hello", "Test element text is");
  
  view.updateLayer();
  ok(view.$(".test").length > 0, "Test element is still present");
  equals(view.$(".test").text(), "Hi", "Test element text has changed to ");
  equals(view.$().attr("title"), "test", "Test element has a title of ");
});

test("calling createLayer and updateLayer on render-only views that replace content render and update properly.", function() {
  var view = replacingRenderView.create();
  view.createLayer();
  ok(view.$(".test").length > 0, "Created test element");
  equals(view.$(".test").text(), "Hello", "Test element text is");
  
  view.updateLayer();
  ok(view.$(".test").length > 0, "Test element is still present");
  equals(view.$(".test").text(), "Hi", "Test element text has changed to ");
  equals(view.$().attr("title"), "test", "Test element has a title of ");
});

test("calling createLayer and updateLayer on render-only views that ONLY do anything on firstTime works.", function() {
  var view = renderSkipUpdateView.create();
  view.createLayer();
  ok(view.$(".test").length > 0, "Created test element");
  equals(view.$(".test").text(), "Hello", "Test element text is");
  
  var oldHTML = view.get("layer").innerHTML;
  view.updateLayer();
  equals(view.get("layer").innerHTML, oldHTML, "HTML is still");
});

test("calling createLayer and displayDidChange on render-only views that ONLY do anything on firstTime works.", function() {
  var view = renderSkipUpdateView.create();
  view.createLayer();
  ok(view.$(".test").length > 0, "Created test element");
  equals(view.$(".test").text(), "Hello", "Test element text is");
  
  var oldHTML = view.get("layer").innerHTML;
  view.displayDidChange();
  equals(view.get("layer").innerHTML, oldHTML, "HTML is still");
});

test("calling createLayer and updateLayer on renderFirst views render and update properly.", function() {
  var renderFirstView = rendererView.extend({
    render: function(context, firstTime){
      context.attr("alt", "fromRender"); // will get overriden by renderer...
      sc_super();
      if (firstTime) {
        context.push("<a class='render'>original</a>");
      } else {
        context.attr("title", "renderOverride");
        this.$(".render").text("new");
      }
    }
  });
  
  var view = renderFirstView.create();
  view.createLayer();
  
  // check that the properties are all fine
  ok(view.$(".render").length > 0, "Render created its element");
  ok(view.$(".test").length > 0, "Renderer created its element");
  equals(view.$(".render").text(), "original", "Render set text to");
  
  // we should have "alt" from renderer: test
  equals(view.$().attr("alt"), "test", "alt should have been overridden by renderer");
  
  // update
  view.updateLayer();
  
  // and check again
  ok(view.$(".render").length > 0, "Render created its element");
  ok(view.$(".test").length > 0, "Renderer created its element");
  equals(view.$(".render").text(), "new", "Render changed its text to");
  
  // title should now be from render
  equals(view.$().attr("title"), "renderOverride", "title should now be");
});

test("rendering and updating a view with various kinds of non-renderer children works, without updating children.", function() {
  /* 
  We test 4 kinds of children:
  plain
  render function that pushes to context on firstTime
  render function that pushes to context no matter what
  render function that pushes on firstTime and updates otherwise.
  
  Note: We are, in fact, testing that updates do NOT happen.
  */
  var childViewsView = SC.View.extend({
    childViews: "child1 child2 child3 child4".w(),
    child1: SC.View.extend({
      classNames: "test test-1".w()
    }),
    child2: SC.View.extend({
      classNames: "test test-2".w(),
      render: function(context, firstTime) {
        // this one will render a-special, but only on firstTime
        if (firstTime) {
          context.push("<a class='test-2-content'>content</a>");
        }
      }
    }),
    child3: SC.View.extend({
      classNames: "test test-3".w(),
      render: function(context, firstTime) {
        // this one will always render fully.
        if (firstTime) context.push("<a class='test-3-content'>content</a>");
        else context.push("<a class='test-3-content'>content-updated</a>")
      }
    }),
    
    child4: SC.View.extend({
      classNames: "test test-4".w(),
      render: function(context, firstTime) {
        if (firstTime) {
          context.push("<a class='test-4-content'>content</a>");
        } else {
          console.error("update child 4");
          this.$(".test-4-content").text("content-updated");
        }
      }
    })
  });
  
  var view = childViewsView.create();
  view.createLayer();
  
  // check if rendering happened
  equals(view.$(".test").length, 4, "number of child views rendered should be");
  
  // now, check if the children themselves can access their layer
  ok(view.child1.$().hasClass("test-1"), "child view gets its layer and has class name");
  equals(view.child2.$(".test-2-content").text(), "content", "child view 2 has content");
  equals(view.child3.$(".test-3-content").text(), "content", "child view 3 has content");
  equals(view.child4.$(".test-4-content").text(), "content", "child view 4 has content");
  
  // now, update and try again
  view.updateLayer();
  
  // make sure we're still fine
  equals(view.$(".test").length, 4, "number of child views after updating should be");
  
  // now, check if the children themselves can access their layer
  // and note: they should NOT have updated (they get to do that themselves)
  ok(view.child1.$().hasClass("test-1"), "after updating child view gets its layer and has class name");
  equals(view.child2.$(".test-2-content").text(), "content", "child view 2 has content");
  equals(view.child3.$(".test-3-content").text(), "content", "child view 3 has NON-updated content");
  equals(view.child4.$(".test-4-content").text(), "content", "child view 4 has NOT updated content");
});

