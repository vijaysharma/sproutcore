// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class
  @extends SC.Renderer
  @since SproutCore 1.1
*/
require("theme");
SC.EmptyTheme.renderers.Title = SC.Renderer.extend({
  render: function(context) {
    var icon = this.icon,
        image = '' ,
        title = this.title ,
        needsTitle = (!SC.none(title) && title.length>0), imgTitle;
    if(this.escapeHTML) title = SC.RenderContext.escapeHTML(title) ;
        
    // get the icon.  If there is an icon, then get the image and update it.
    // if there is no image element yet, create it and insert it just before
    // title.
    
    if (icon) {
      var blank = SC.BLANK_IMAGE_URL;

      if (icon.indexOf('/') >= 0) {
        image = '<img src="'+icon+'" alt="" class="icon" />';
      } else {
        image = '<img src="'+blank+'" alt="" class="'+icon+'" />';
      }
      needsTitle = YES ;
    }
    imgTitle = image + title;
    if(this.needsEllipsis){
      context.push('<label class="sc-button-label ellipsis">'+imgTitle+'</label>'); 
    } else {
        context.push('<label class="sc-button-label">'+imgTitle+'</label>'); 
    }
    this._ImageTitleCached = imgTitle;
  },
  
  update: function() {
    var icon = this.icon,
        image = '' ,
        title = this.title ,
        needsTitle = (!SC.none(title) && title.length>0), imgTitle,
        elem, htmlNode;
    if(this.escapeHTML) title = SC.RenderContext.escapeHTML(title);
    
    if (icon) {
      var blank = SC.BLANK_IMAGE_URL;

      if (icon.indexOf('/') >= 0) {
        image = '<img src="'+icon+'" alt="" class="icon" />';
      } else {
        image = '<img src="'+blank+'" alt="" class="'+icon+'" />';
      }
      needsTitle = YES ;
    }
    imgTitle = image + title;
    
    elem = this.$('label');  
    if ( (htmlNode = elem[0])){
      if(needsTitle) { 
        if(this.needsEllipsis){
          elem.addClass('ellipsis');
          if(this._ImageTitleCached !== imgTitle) {
            this._ImageTitleCached = imgTitle; // Update the cache
            htmlNode.innerHTML = imgTitle;
          }
        }else{
          elem.removeClass('ellipsis');
          if(this._ImageTitleCached !== imgTitle) {
            this._ImageTitleCached = imgTitle; // Update the cache
            htmlNode.innerHTML = imgTitle;
          }
        } 
      }
      else { htmlNode.innerHTML = ''; } 
    }    
  }
});

SC.EmptyTheme.renderers.title = SC.EmptyTheme.renderers.Title.create();