(function(){

  function setSelected(node, selected, last){
    var last = node.xtag.selected;
    var select = selected != last;
    if (select){
      if (last) last.removeAttribute('selected');
      node.xtag.selected = selected;
      selected.setAttribute('selected', '');
      selected.hasAttribute('group') ? node.setAttribute('group', selected.getAttribute('group')) : node.removeAttribute('group');
    }
    updateIndex(node, selected);
    if (select) xtag.fireEvent(selected, 'slideselected', { detail: { lastSlide: last } });
  }

  function updateIndex(node, selected){
    selected = selected || node.querySelector('x-slidebox > [selected]');
    node.selectedIndex = node.xtag.index = Array.prototype.indexOf.call(node.children, selected);
    node.setAttribute('slide-count', node.children.length);
    node.setAttribute('slide-number', node.xtag.index + 1);
  }

  xtag.register('x-slidebox', {
    events: {
      'tap:delegate(x-slidebox > x-slide)': function(e){
        var slidebox = e.currentTarget;
        if (!this.hasAttribute('selected')) {
          if (this == slidebox.firstElementChild) {
            slidebox.slidePrevious();
          }
          else if (this == slidebox.lastElementChild || (slidebox.loop && this == slidebox.children[slidebox.children.length - 2])) {
            slidebox.slideNext();
          }
        }
      },
      'contextmenu:delegate(x-slidebox > x-slide:not([selected]))': function(e){
        e.preventDefault();
      }
    },
    accessors: {
      loop: {
        attribute: {
          boolean: true
        }
      },
      selectedIndex: {
        attribute: {
          validate: function(val){
            return Number(val) || 0
          }
        },
        set: function(val){
          if (val != this.xtag.index) this.slideTo(val);
          this.xtag.index = val;

        },
        get: function(){
          return this.xtag.index;
        }
      }
    },
    methods: {
      slideNext: function(){
        var selected = this.xtag.selected;
        setSelected(this, (selected && selected.nextElementSibling) || this.firstElementChild, selected);
      },
      slidePrevious: function(){
        var selected = this.xtag.selected;
        setSelected(this, (selected && selected.previousElementSibling) || this.lastElementChild, selected);
      },
      slideTo: function(val){
        if (typeof val == 'number') {
          var slide = this.children[val];
          if (slide && slide != this.xtag.selected) setSelected(this, slide);
        }
        else if (val && val != this.xtag.selected) {
          setSelected(this, val);
        }
      }
    }
  });

  function selectSlide(slide){
    var parent = slide.parentNode;
    if (parent && parent.nodeName == 'X-SLIDEBOX' && parent.xtag.selected != slide) {
      parent.slideTo(slide);
    }
  }

  xtag.register('x-slide', {
    lifecycle: {
      inserted: function(){
        if (this.selected) selectSlide(this);
        else {
          var parent = this.parentNode;
          if (parent && parent.nodeName == 'X-SLIDEBOX') updateIndex(parent);
        }
      }
    },
    accessors: {
      selected: {
        attribute: { boolean: true },
        set: function(val){
          if (val) selectSlide(this);
        }
      }
    }
  });

})();
