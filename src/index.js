// File: easy-carousel.js

/**
 * EasyCarousel - A lightweight, responsive, dependency-free JavaScript carousel plugin.
 *
 * Author: Nikba Creative Studio
 * License: MIT
 */

import './styles.css';

class EasyCarousel {
    constructor(selector, options = {}) {
      this.container = typeof selector === 'string' ? document.querySelector(selector) : selector;
      if (!this.container) {
        console.error('EasyCarousel: Container element not found');
        return;
      }
  
      this.settings = Object.assign({}, EasyCarousel.defaults, options);
      this.currentIndex = this.settings.startPosition || 0;
      this.previousIndex = null;
      this.autoplayInterval = null;
      this.originalItemsCount = 0;
      this.cloneCount = 0;
  
      this.drag = {
        startX: 0,
        endX: 0,
        startY: 0,
        endY: 0,
        startTime: 0,
        isDragging: false,
        preventClick: false,
        dragDistance: 0
      };

      // Store event listeners for cleanup
      this.boundEvents = {
        resize: this.onResize.bind(this),
        dragStart: this.onDragStart.bind(this),
        dragMove: this.onDragMove.bind(this),
        dragEnd: this.onDragEnd.bind(this),
        keydown: this.onKeydown.bind(this)
      };
  
      this.init();
    }
  
    static get defaults() {
      return {
        items: 3,
        margin: 0,
        loop: false,
        center: false,
        mouseDrag: true,
        touchDrag: true,
        autoWidth: false,
        startPosition: 0,
        nav: false,
        dots: true,
        autoplay: false,
        autoplayTimeout: 5000,
        autoplayHoverPause: false,
        lazyLoad: false,
        animateIn: false,
        animateOut: false,
        responsive: {},
        responsiveRefreshRate: 200,
      };
    }
  
    init() {
      this.updateResponsiveSettings();
      this.buildCarousel();
      this.applyStyles();
      this.registerEvents();
      if (this.settings.nav) this.createNavigation();
      if (this.settings.dots) this.createDots();
      if (this.settings.autoplay) this.startAutoplay();
      if (this.settings.lazyLoad) this.lazyLoadImages();
    }
  
    updateResponsiveSettings() {
      if (!this.settings.responsive || typeof window === 'undefined') return;
  
      const width = window.innerWidth;
      const breakpoints = Object.keys(this.settings.responsive).map(n => parseInt(n)).sort((a, b) => a - b);
  
      let matched = {};
      breakpoints.forEach(bp => {
        if (width >= bp) matched = this.settings.responsive[bp];
      });
  
      this.settings = Object.assign({}, EasyCarousel.defaults, this.settings, matched);
    }
  
    buildCarousel() {
      this.stage = document.createElement('div');
      this.stage.className = 'ec-stage';
  
      const children = Array.from(this.container.children);
      this.originalItemsCount = children.length;
      
      // Create items array
      this.items = [];
      
      // If loop is enabled, add clones for seamless infinite scrolling
      if (this.settings.loop && this.originalItemsCount > this.settings.items) {
        this.cloneCount = this.settings.items;
        
        // Add clones at the beginning (last items)
        for (let i = this.originalItemsCount - this.cloneCount; i < this.originalItemsCount; i++) {
          const cloneItem = this.createCarouselItem(children[i].cloneNode(true), true);
          this.stage.appendChild(cloneItem);
          this.items.push(cloneItem);
        }
      }
      
      // Add original items
      children.forEach((child) => {
        const item = this.createCarouselItem(child, false);
        this.stage.appendChild(item);
        this.items.push(item);
      });
      
      // If loop is enabled, add clones at the end (first items)
      if (this.settings.loop && this.originalItemsCount > this.settings.items) {
        for (let i = 0; i < this.cloneCount; i++) {
          const cloneItem = this.createCarouselItem(children[i].cloneNode(true), true);
          this.stage.appendChild(cloneItem);
          this.items.push(cloneItem);
        }
      }
  
      this.container.innerHTML = '';
      this.container.classList.add('easy-carousel');
      this.container.appendChild(this.stage);
      
      // Adjust starting position if loop is enabled
      if (this.settings.loop && this.originalItemsCount > this.settings.items) {
        this.currentIndex = this.cloneCount + (this.settings.startPosition || 0);
      }
    }
    
    createCarouselItem(child, isClone = false) {
      const item = document.createElement('div');
      item.className = 'ec-item';
      if (isClone) item.classList.add('ec-clone');
      item.style.marginRight = `${this.settings.margin}px`;
      item.appendChild(child);
      return item;
    }
  
    applyStyles() {
      const itemWidth = 100 / this.settings.items;
      this.items.forEach((item) => {
        item.style.flex = `0 0 ${itemWidth}%`;
      });
      this.stage.style.display = 'flex';
      this.stage.style.transition = 'transform 0.3s ease';
      this.goTo(this.currentIndex);
    }
  
    registerEvents() {
      if (this.settings.autoplayHoverPause) {
        this.container.addEventListener('mouseenter', () => this.stopAutoplay());
        this.container.addEventListener('mouseleave', () => this.startAutoplay());
      }
  
      if (this.settings.touchDrag || this.settings.mouseDrag) {
        this.stage.addEventListener('mousedown', this.boundEvents.dragStart);
        this.stage.addEventListener('touchstart', this.boundEvents.dragStart);
        document.addEventListener('mousemove', this.boundEvents.dragMove);
        document.addEventListener('touchmove', this.boundEvents.dragMove, { passive: false });
        document.addEventListener('mouseup', this.boundEvents.dragEnd);
        document.addEventListener('touchend', this.boundEvents.dragEnd);
      }

      // Add keyboard navigation
      this.container.setAttribute('tabindex', '0');
      this.container.addEventListener('keydown', this.boundEvents.keydown);
  
      window.addEventListener('resize', this.boundEvents.resize);

      // Add click prevention
      this.stage.addEventListener('click', (e) => {
        if (this.drag.preventClick) {
          e.preventDefault();
          e.stopPropagation();
          this.drag.preventClick = false;
        }
      }, true);
    }

    onKeydown(e) {
      switch(e.key) {
        case 'ArrowLeft':
          this.prev();
          break;
        case 'ArrowRight':
          this.next();
          break;
      }
    }
  
    onResize() {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        this.updateResponsiveSettings();
        this.applyStyles();
      }, this.settings.responsiveRefreshRate);
    }
  
    onDragStart(e) {
      if (e.type === 'mousedown' && !this.settings.mouseDrag) return;
      if (e.type === 'touchstart' && !this.settings.touchDrag) return;
      if (e.button && e.button !== 0) return; // Only handle left mouse button

      // Prevent text selection during drag
      e.preventDefault();
      
      this.drag.isDragging = true;
      this.drag.startTime = Date.now();
      this.drag.preventClick = false;
      
      if (e.type === 'touchstart') {
          this.drag.startX = e.touches[0].clientX;
          this.drag.startY = e.touches[0].clientY;
      } else {
          this.drag.startX = e.clientX;
          this.drag.startY = e.clientY;
      }

      // Remove transition during drag
      this.stage.style.transition = 'none';
      
      // Add dragging class to container
      this.container.classList.add('is-dragging');
    }
  
    onDragMove(e) {
      if (!this.drag.isDragging) return;

      let currentX, currentY;
      if (e.type === 'touchmove') {
          currentX = e.touches[0].clientX;
          currentY = e.touches[0].clientY;
      } else {
          currentX = e.clientX;
          currentY = e.clientY;
      }

      // Calculate drag distance
      this.drag.dragDistance = currentX - this.drag.startX;
      
      // Check if scrolling vertically on touch devices
      if (e.type === 'touchmove') {
          const deltaX = Math.abs(this.drag.dragDistance);
          const deltaY = Math.abs(currentY - this.drag.startY);
          
          // If vertical scroll is detected, stop dragging
          if (deltaY > deltaX) {
              this.onDragEnd(e);
              return;
          }
      }

      // Calculate the new position
      const itemWidth = this.container.offsetWidth / this.settings.items;
      const currentPosition = -(this.currentIndex * itemWidth);
      const maxDrag = itemWidth;
      
      // Limit drag distance
      if (Math.abs(this.drag.dragDistance) > maxDrag) {
          this.drag.dragDistance = (this.drag.dragDistance > 0 ? 1 : -1) * maxDrag;
      }

      const newPosition = currentPosition + this.drag.dragDistance;
      this.stage.style.transform = `translateX(${newPosition}px)`;

      // Prevent click if dragging
      if (Math.abs(this.drag.dragDistance) > 5) {
          this.drag.preventClick = true;
      }

      e.preventDefault();
    }
  
    onDragEnd(e) {
      if (!this.drag.isDragging) return;
      
      this.drag.isDragging = false;
      this.drag.endTime = Date.now();
      
      // Calculate drag speed and distance
      const dragDuration = this.drag.endTime - this.drag.startTime;
      const dragSpeed = Math.abs(this.drag.dragDistance) / dragDuration;
      const dragThreshold = 0.2; // Adjust this value to change sensitivity
      
      // Restore transition
      this.stage.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      
      // Remove dragging class
      this.container.classList.remove('is-dragging');

      // Determine if we should change slide
      if (Math.abs(this.drag.dragDistance) > (this.container.offsetWidth / this.settings.items) * 0.2 || dragSpeed > dragThreshold) {
          if (this.drag.dragDistance < 0) {
              this.next();
          } else {
              this.prev();
          }
      } else {
          // Return to current slide if threshold not met
          this.goTo(this.currentIndex);
      }

      // Reset drag object
      this.drag.dragDistance = 0;
      
      // Clear selection if any
      if (window.getSelection) {
          window.getSelection().removeAllRanges();
      }
    }
  
    goTo(index, skipAnimation = false) {
      if (this.settings.loop && this.originalItemsCount > this.settings.items) {
        // Handle infinite loop with clones
        let nextIndex = index;
        
        // Allow the transition to happen first
        if (this.settings.animateOut && this.previousIndex !== null && this.items[this.previousIndex]) {
          this.items[this.previousIndex].classList.remove(this.settings.animateIn);
          this.items[this.previousIndex].classList.add(this.settings.animateOut);
        }
    
        if (this.settings.animateIn && this.items[nextIndex] && nextIndex >= 0 && nextIndex < this.items.length) {
          this.items[nextIndex].classList.remove(this.settings.animateOut);
          this.items[nextIndex].classList.add(this.settings.animateIn);
        }
    
        this.previousIndex = this.currentIndex;
        this.currentIndex = nextIndex;
        
        // Apply transform
        const offset = -(this.currentIndex * (100 / this.settings.items));
        if (skipAnimation) {
          this.stage.style.transition = 'none';
        }
        this.stage.style.transform = `translateX(${offset}%)`;
        
        // Check if we need to reposition after animation
        if (!skipAnimation) {
          setTimeout(() => {
            this.checkAndRepositionForInfiniteLoop();
          }, 300); // Match the transition duration
        }
        
        if (skipAnimation) {
          // Restore transition after repositioning
          setTimeout(() => {
            this.stage.style.transition = 'transform 0.3s ease';
          }, 50);
        }
      } else {
        // Original non-loop behavior
        const maxIndex = this.items.length - this.settings.items;
        const nextIndex = Math.max(0, Math.min(index, maxIndex));
    
        if (this.settings.animateOut && this.previousIndex !== null && this.items[this.previousIndex]) {
          this.items[this.previousIndex].classList.remove(this.settings.animateIn);
          this.items[this.previousIndex].classList.add(this.settings.animateOut);
        }
    
        if (this.settings.animateIn && this.items[nextIndex]) {
          this.items[nextIndex].classList.remove(this.settings.animateOut);
          this.items[nextIndex].classList.add(this.settings.animateIn);
        }
    
        this.previousIndex = nextIndex;
        this.currentIndex = nextIndex;
    
        const offset = -(this.currentIndex * (100 / this.settings.items));
        this.stage.style.transform = `translateX(${offset}%)`;
      }
      
      this.updateDots();
      if (this.settings.lazyLoad) this.lazyLoadImages();
    }
    
    checkAndRepositionForInfiniteLoop() {
      if (!this.settings.loop || this.originalItemsCount <= this.settings.items) return;
      
      // If we're at the beginning clones, jump to the real items at the end
      if (this.currentIndex < this.cloneCount) {
        const newIndex = this.originalItemsCount + this.currentIndex;
        this.goTo(newIndex, true);
      }
      // If we're at the end clones, jump to the real items at the beginning  
      else if (this.currentIndex >= this.cloneCount + this.originalItemsCount) {
        const newIndex = this.currentIndex - this.originalItemsCount;
        this.goTo(newIndex, true);
      }
    }
  
    next() {
      this.goTo(this.currentIndex + 1);
    }
  
    prev() {
      this.goTo(this.currentIndex - 1);
    }
  
    createNavigation() {
      const navContainer = document.createElement('div');
      navContainer.className = 'ec-nav';
  
      const prevBtn = document.createElement('button');
      prevBtn.innerText = '<';
      prevBtn.className = 'ec-prev';
      prevBtn.addEventListener('click', () => this.prev());
  
      const nextBtn = document.createElement('button');
      nextBtn.innerText = '>';
      nextBtn.className = 'ec-next';
      nextBtn.addEventListener('click', () => this.next());
  
      navContainer.appendChild(prevBtn);
      navContainer.appendChild(nextBtn);
      this.container.appendChild(navContainer);
    }
  
    createDots() {
      this.dotsContainer = document.createElement('div');
      this.dotsContainer.className = 'ec-dots';
  
      // For infinite loop, only show dots for original items
      const dotsCount = this.settings.loop && this.originalItemsCount > this.settings.items 
        ? this.originalItemsCount - this.settings.items + 1
        : this.items.length - this.settings.items + 1;
      this.dots = [];
  
      for (let i = 0; i < dotsCount; i++) {
        const dot = document.createElement('div');
        dot.className = 'ec-dot';
        dot.addEventListener('click', () => {
          if (this.settings.loop && this.originalItemsCount > this.settings.items) {
            this.goTo(this.cloneCount + i);
          } else {
            this.goTo(i);
          }
        });
        this.dotsContainer.appendChild(dot);
        this.dots.push(dot);
      }
  
      this.updateDots();
      this.container.appendChild(this.dotsContainer);
    }
  
    updateDots() {
      if (!this.dots) return;
      
      let activeIndex;
      if (this.settings.loop && this.originalItemsCount > this.settings.items) {
        // Calculate the active dot index for infinite loop
        if (this.currentIndex < this.cloneCount) {
          // We're in the beginning clones, map to end of original items
          activeIndex = this.originalItemsCount - this.cloneCount + this.currentIndex;
        } else if (this.currentIndex >= this.cloneCount + this.originalItemsCount) {
          // We're in the end clones, map to beginning of original items
          activeIndex = this.currentIndex - this.cloneCount - this.originalItemsCount;
        } else {
          // We're in the original items
          activeIndex = this.currentIndex - this.cloneCount;
        }
      } else {
        activeIndex = this.currentIndex;
      }
      
      this.dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === activeIndex);
      });
    }
  
    startAutoplay() {
      this.stopAutoplay();
      this.autoplayInterval = setInterval(() => this.next(), this.settings.autoplayTimeout);
    }
  
    stopAutoplay() {
      if (this.autoplayInterval) {
        clearInterval(this.autoplayInterval);
        this.autoplayInterval = null;
      }
    }
  
    lazyLoadImages() {
      const visibleItems = this.items.slice(this.currentIndex, this.currentIndex + this.settings.items);
      visibleItems.forEach(item => {
        const imgs = item.querySelectorAll('[data-src]');
        imgs.forEach(img => {
          if (img.tagName.toLowerCase() === 'img') {
            img.src = img.dataset.src;
          } else {
            img.style.backgroundImage = `url('${img.dataset.src}')`;
          }
          img.removeAttribute('data-src');
        });
      });
    }

    destroy() {
      // Remove all event listeners
      if (this.settings.touchDrag || this.settings.mouseDrag) {
        this.stage.removeEventListener('mousedown', this.boundEvents.dragStart);
        this.stage.removeEventListener('touchstart', this.boundEvents.dragStart);
        document.removeEventListener('mousemove', this.boundEvents.dragMove);
        document.removeEventListener('touchmove', this.boundEvents.dragMove);
        document.removeEventListener('mouseup', this.boundEvents.dragEnd);
        document.removeEventListener('touchend', this.boundEvents.dragEnd);
      }

      window.removeEventListener('resize', this.boundEvents.resize);
      this.container.removeEventListener('keydown', this.boundEvents.keydown);

      // Stop autoplay if running
      this.stopAutoplay();

      // Remove added classes and restore original content
      this.container.classList.remove('easy-carousel');
      this.container.removeAttribute('tabindex');
      
      // Restore original content (exclude clones)
      const originalItems = Array.from(this.stage.querySelectorAll('.ec-item:not(.ec-clone)')).map(item => item.firstElementChild);
      this.container.innerHTML = '';
      originalItems.forEach(item => this.container.appendChild(item));

      // Clear references
      this.items = null;
      this.stage = null;
      this.dots = null;
      this.dotsContainer = null;
      this.boundEvents = null;
      this.originalItemsCount = 0;
      this.cloneCount = 0;
    }
  }
  
  export default EasyCarousel;
