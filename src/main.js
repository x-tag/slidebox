(function(){

  function fireSelected(selected, last){
    xtag.fireEvent(selected, 'slideselected', { detail: { lastSlide: last } });
  }

  xtag.register('x-slidebox', {
    events: {
      'tap:delegate(x-slidebox > section)': function(e){
        var slidebox = e.currentTarget;
        if (!this.hasAttribute('selected')) {
          if (this == slidebox.firstElementChild) {
            slidebox.slidePrevious();
          }
          else if (this == slidebox.lastElementChild || (slidebox.loop && this == slidebox.children[slidebox.children.length - 2])) {
            slidebox.slideNext();
          }
        }
      }
    },
    accessors: {
      loop: {
        attribute: {
          boolean: true
        }
      }
    },
    methods: {
      slideNext: function(){
        var selected = this.querySelector('x-slidebox > [selected]');
        if (selected) {
          var next = selected.nextElementSibling;
          if (next) {
            selected.removeAttribute('selected');
            next.setAttribute('selected', '');
            fireSelected(next, selected);
          }
          else {
            selected.removeAttribute('selected');
            this.firstElementChild.setAttribute('selected', '');
            fireSelected(this.firstElementChild, selected);
          }
        }
      },
      slidePrevious: function(){
        var selected = this.querySelector('x-slidebox > [selected]');
        if (selected) {
          var previous = selected.previousElementSibling;
          if (previous) {
            selected.removeAttribute('selected');
            previous.setAttribute('selected', '');
            fireSelected(previous, selected);
          }
        }
      },
      slideTo: function(val){
        var selected = this.querySelector('x-slidebox > [selected]');
        if (typeof val == 'number') {
          var slide = this.children[val];
          if (slide && slide != selected) {
            if (selected) selected.removeAttribute('selected');
            slide.setAttribute('selected', '');
            fireSelected(slide, selected);
          }
        }
        else if (val && val != selected) {
          if (selected) selected.removeAttribute('selected');
          val.setAttribute('selected', '');
          fireSelected(val, selected);
        }
      }
    }
  });

})();
