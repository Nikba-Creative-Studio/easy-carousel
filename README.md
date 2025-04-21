# Easy Carousel

A lightweight, responsive, and feature-rich JavaScript carousel/slider library with no dependencies.

## Features

- 🚀 Lightweight and dependency-free
- 📱 Fully responsive
- 🖱️ Mouse drag support
- 📲 Touch swipe support
- ⌨️ Keyboard navigation
- 🔄 Infinite loop option
- ⏯️ Autoplay with pause on hover
- 🖼️ Lazy loading support
- ✨ CSS3 animations
- 🎯 Center mode
- 📐 Dynamic slide width
- 🎨 Customizable navigation and dots
- 🖥️ Responsive breakpoints

## Installation

### Via NPM
```bash
npm install easy-carousel
```

### Via CDN
```html
<link rel="stylesheet" href="path/to/easy-carousel.css">
<script src="path/to/easy-carousel.js"></script>
```

## Basic Usage

```html
<!-- HTML Structure -->
<div class="my-carousel">
    <img src="slide1.jpg" alt="Slide 1">
    <img src="slide2.jpg" alt="Slide 2">
    <img src="slide3.jpg" alt="Slide 3">
</div>

<script>
    // Initialize carousel
    const carousel = new EasyCarousel('.my-carousel', {
        items: 3,
        margin: 20,
        loop: true,
        nav: true,
        dots: true
    });
</script>
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| items | number | 3 | Number of items to show |
| margin | number | 0 | Margin between items (px) |
| loop | boolean | false | Infinite loop |
| center | boolean | false | Center active item |
| mouseDrag | boolean | true | Enable mouse drag |
| touchDrag | boolean | true | Enable touch drag |
| autoWidth | boolean | false | Variable width items |
| startPosition | number | 0 | Starting position |
| nav | boolean | false | Show navigation buttons |
| dots | boolean | true | Show navigation dots |
| autoplay | boolean | false | Enable autoplay |
| autoplayTimeout | number | 5000 | Autoplay interval (ms) |
| autoplayHoverPause | boolean | false | Pause on hover |
| lazyLoad | boolean | false | Enable lazy loading |
| animateIn | string | false | Animation class for entering items |
| animateOut | string | false | Animation class for leaving items |
| responsive | object | {} | Responsive breakpoints config |

## Responsive Configuration

```javascript
const carousel = new EasyCarousel('.my-carousel', {
    items: 4,
    responsive: {
        0: {
            items: 1
        },
        768: {
            items: 2
        },
        1024: {
            items: 4
        }
    }
});
```

## Methods

| Method | Description |
|--------|-------------|
| next() | Go to next slide |
| prev() | Go to previous slide |
| goTo(index) | Go to specific slide |
| destroy() | Destroy carousel instance |

## Events

The carousel automatically handles:
- Window resize events
- Mouse drag events
- Touch events
- Keyboard navigation (arrow keys)
- Autoplay events

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- IE11 and above

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Development

To modify or enhance the carousel:

1. Clone the repository
2. Make your changes in the `src` directory
3. Test your changes using the demo page
4. Submit a pull request

## Examples

Check out the `demo` directory for various implementation examples.