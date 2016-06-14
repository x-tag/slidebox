(function(){

  var arrowMap = { back: 'slideBack', forward: 'slideForward' };

  function setContainerOffset(node, percent, animate) {
    var container = node.xtag.container;
    animate ? container.setAttribute('x-slidebox-animate', '') : container.removeAttribute('x-slidebox-animate');
    container.style.transform = container.style[xtag.prefix.dom + 'Transform'] = 'translate('+ percent +'%, 0%)';
  }

  function setSelected(box, index){
    var slides = box.slides;
    var count = slides.length;
    var last = box.xtag.selected;
    var selected = box.xtag.selected = slides[index];
    slides.forEach(function(slide){
      slide.removeAttribute('selected');
    });
    selected.setAttribute('selected', '');
    box.setAttribute('slide-number', index + 1);
    setSlideCount(box, count);
    if (index == 0) box.setAttribute('slide-position', 'start');
    else if (index == count - 1) box.setAttribute('slide-position', 'end');
    else box.removeAttribute('slide-position');
    xtag.fireEvent(selected, 'selected', { detail: { lastSlide: last } });
  }

  xtag.register('x-slidebox', {
    content: function(){/*
      <x-slidebox-arrow arrow-direction="back"></x-slidebox-arrow>
      <x-slidebox-arrow arrow-direction="forward"></x-slidebox-arrow>
    */},
    lifecycle: {
      created: function(){
        this.xtag.center = { x: 0, y: 0 };
        this.setAttribute('touch-action', 'none');
        var selected;
        var container = this.xtag.container = document.createElement('x-slidebox-slides');
        xtag.toArray(this.children).forEach(function(slide){
          if (slide.nodeName == 'X-SLIDE') {
            container.appendChild(slide);
            if (slide.hasAttribute('selected')) selected = slide;
          }
        });
        var count = container.children.length;
        setSlideCount(this, count);
        this.appendChild(container);
        if (!selected && count) this.slideTo(0);
      }
    },
    events: {
      'tap:delegate(x-slidebox-arrow)': function(event){
        var box = event.currentTarget;
        if (this.parentNode == box){
          box.xtag.arrowtap = true;
          box[arrowMap[this.getAttribute('arrow-direction')]](true);
        }
      },
      'tapmove:debounce': function(event){
        var data = this.xtag;
        if (event.type == 'pointerdown') {
          data.center.x = event.clientX;
          data.center.y = event.clientY;
          if (document.selection) document.selection.empty();
          else window.getSelection().removeAllRanges();
        }
        else if (event.type == 'pointermove') {
          var delta = data.delta = event[data.axisProp] - data.center[data.axis];
          var count = data.count;
          var index = data.index;
          var direction = delta > 0;
          var offset = (delta / data.container.scrollWidth) * 100;
          if ((index == 0 && direction) || (index == count - 1 && !direction)) {
            offset *= .4;
          }
          if (!data.sliding) data.sliding = this.setAttribute('x-slidebox-sliding', '') ? true : true;
          setContainerOffset(this, -(100 / count) * index + offset);
        }
        else {
          if (!data.arrowtap) {
            if (Math.abs(data.delta) > (Math.min((data.container.scrollWidth / data.count) / 5, 150))) {
              data.delta > 0 ? this.slideBack(true) : this.slideForward(true);
            }
            else this.slideTo(data.index, true);
          }
          data.delta = 0;
          data.sliding = data.arrowtap = this.removeAttribute('x-slidebox-sliding') ? false : false;
        }
      },
      'contextmenu:delegate(x-slidebox-arrow)': function(e){
        e.preventDefault();
      }
    },
    accessors: {
      axis: {
        attribute: {
          def: 'x'
        },
        set: function(val, old){
          this.xtag.axis = val.toLowerCase();
          this.xtag.axisProp = 'client' + val.toUpperCase();
        }
      },
      slides: {
        get: function(){
          return xtag.toArray(this.xtag.container.children);
        }
      },
      selectedIndex: {
        attribute: {
          validate: function(val){
            return Number(val) || 0
          }
        },
        set: function(val, old){
          if (this.xtag.index > -1 && val != this.xtag.index) this.slideTo(val);
          this.xtag.index = val;
        },
        get: function(){
          return this.xtag.index;
        }
      }
    },
    methods: {
      slideTo: function(index, animate) {
        var slides = this.slides;
        var count = slides.length;
        index = index.nodeName ? slides.indexOf(index) : Number(index);
        index = this.selectedIndex = this.xtag.index = Math.max(0, Math.min(index, count - 1));
        setSelected(this, index);
        setContainerOffset(this, -((100 / count) * index), animate);
      },
      slideForward: function(animate){
        this.slideTo(this.xtag.index + 1, animate);
      },
      slideBack: function(animate){
        this.slideTo(this.xtag.index - 1, animate);
      }
    }
  });

  function selectSlide(slide){
    var node = slide.parentNode && slide.parentNode.parentNode;
    if (node && node.nodeName == 'X-SLIDEBOX' &&
        node.xtag.container &&
        node.xtag.selected != slide) {
      node.slideTo(slide);
    }
  }

  function setSlideCount(box, count){
    var count = box.xtag.count = count;
    box.setAttribute('slide-count', count);
    box.xtag.container.style.width = count * 100 + '%';
  }

  xtag.register('x-slide', {
    lifecycle: {
      inserted: function(){
        var box = this.parentNode;
        if (box && box.nodeName == 'X-SLIDEBOX') {
          box.xtag.container.appendChild(this);
          if (this.selected || !box.xtag.selected) box.slideTo(this);
        }
      },
      removed: function(parent){
        var box = parent.parentNode;
        if (box && box.nodeName == 'X-SLIDEBOX') setSlideCount(box, box.xtag.count - 1)
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
