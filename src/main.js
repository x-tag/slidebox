(function(){

  function setContainerOffset(node, percent, animate) {
    var container = node.xtag.container;
    animate ? container.setAttribute('x-slidebox-animate', '') : container.removeAttribute('x-slidebox-animate');
    container.style.transform = container.style[xtag.prefix.dom + 'Transform'] = 'translate('+ percent +'%, 0%)';
  }

  function setSelected(node, index){
    var slides = node.slides;
    var count = node.xtag.count = slides.length;
    var selected = node.xtag.selected = slides[index];
    slides.forEach(function(slide){
      slide.removeAttribute('selected');
    });
    selected.setAttribute('selected', '');
    node.setAttribute('slide-count', node.xtag.count = count);
    node.setAttribute('slide-number', index + 1);
    if (index == 0) node.setAttribute('slide-position', 'start');
    else if (index == count - 1) node.setAttribute('slide-position', 'end');
    else node.removeAttribute('slide-position');
    xtag.fireEvent(selected, 'slideselected');
  }

  xtag.register('x-slidebox', {
    lifecycle: {
      created: function(){
        this.setAttribute('touch-action', 'none');
        this.xtag.center = { x: 0, y: 0 };
        this.xtag.container = this.appendChild(document.createElement('x-slidebox-slides'));
        this.xtag.arrowback = this.appendChild(document.createElement('x-slidebox-arrowback'));
        this.xtag.arrowforward = this.appendChild(document.createElement('x-slidebox-arrowforward'));
      }
    },
    events: {
      tap: function(e){
        if (e.target == this.xtag.arrowback) this.slideBack(true);
        else if (e.target == this.xtag.arrowforward) this.slideForward(true);
      },
      tapmove: function(event){
        if (event.type == 'pointerdown') {
          this.xtag.center.x = event.clientX;
          this.xtag.center.y = event.clientY;
        }
        else if (event.type == 'pointerup' || event.type == 'pointercancel') {
          if (Math.abs(this.xtag.delta) > ((this.xtag.container.scrollWidth / this.xtag.count) / 3)) {
            if (this.xtag.delta > 0) this.slideBack(true);
            else this.slideForward(true);
          }
          else this.slideTo(this.xtag.index, true);
        }
        else {
          var delta = this.xtag.delta = event[this.xtag.axisProp] - this.xtag.center[this.xtag.axis];
          var count = this.xtag.count;
          var index = this.xtag.index;
          var direction = delta > 0;

          var offset = (delta / this.xtag.container.scrollWidth) * 100;
          if ((index == 0 && direction) || (index == count - 1 && !direction)) {
            offset *= .4;
          }

          setContainerOffset(this, -(100 / count) * index + offset);
        }
      },
      'contextmenu:delegate(x-slidebox-slides > x-slide:not([selected]))': function(e){
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

  xtag.register('x-slide', {
    lifecycle: {
      inserted: function(){
        var box = this.parentNode;
        if (box && box.nodeName == 'X-SLIDEBOX') {
          var container = box.xtag.container;
          container.appendChild(this);
          var count = box.xtag.count = container.children.length;
          box.setAttribute('slide-count', count);
          container.style.width = count * 100 + '%';
          if (this.selected || !box.xtag.selected) box.slideTo(this);
        }
      },
      removed: function(parent){
        var box = parent.parentNode;
        if (box && box.nodeName == 'X-SLIDEBOX') {
          --box.xtag.count;
          box.setAttribute('slide-count', box.xtag.count);
          box.xtag.container.style.width = box.xtag.count * 100 + '%';
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
