# Nathan Bawa - Portfolio Website

A professional portfolio website for a 3D artist and real estate visualization specialist.

## Features

- **Sticky Navigation Bar** - Always visible navigation with smooth scrolling
- **Hero Section** - Eye-catching landing area with clear branding
- **Portfolio Grid** - Project showcase with category filtering (Real Estate, Characters, VR, Motion)
- **About Section** - Personal introduction with photo and bio
- **Services Section** - Clear description of offered services
- **Contact Form** - Simple contact form for inquiries
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Modern Aesthetics** - Dark theme with cyan accents, smooth animations

## Project Structure

```
Urbanstage3Dweb/
├── index.html         # Main HTML file
├── styles.css         # All styling
├── script.js          # JavaScript functionality
├── README.md          # This file
├── projects/          # Portfolio project images
│   ├── project-1.jpg
│   ├── project-2.jpg
│   ├── project-3.jpg
│   ├── project-4.jpg
│   ├── project-5.jpg
│   └── project-6.jpg
└── about/             # About section images
    └── photo.jpg
```

## Getting Started

1. **Add Your Images**:
   - Place 6 portfolio project images in the `projects/` folder
   - Place your profile photo in the `about/` folder
   - Update image filenames if they differ from the defaults

2. **Update Content**:
   - Edit your name in `index.html` (currently "Nathan Bawa")
   - Update the About section text with your bio
   - Add your email and social media links in the Contact section
   - Update project titles and descriptions in the work grid

3. **Customize**:
   - Edit the color scheme in `styles.css` by modifying the CSS variables in `:root`
   - Adjust section padding and spacing as needed
   - Modify services and offerings

4. **Deploy**:
   - Simply open `index.html` in a browser to view locally
   - Upload all files to a web server to publish online

## Customization Guide

### Colors (styles.css)
```css
:root {
  --primary-dark: #1a1a1a;      /* Main background */
  --secondary-dark: #2d2d2d;    /* Section backgrounds */
  --accent-primary: #00d4ff;    /* Cyan - primary color */
}
```

### Fonts
The site uses system fonts for optimal performance. To change:
```css
body {
  font-family: 'Your Font Name', sans-serif;
}
```

### Section Titles
Edit or add new styling in the `.section-title` class for different heading styles.

## Form Configuration

The contact form currently displays a success message locally. To actually send emails, you'll need to:

1. Set up a backend service (Node.js, PHP, etc.)
2. Update the form submission in `script.js` to send data to your server
3. Configure email service (SendGrid, Mailgun, etc.)

Quick CloudFlare Workers solution:
```javascript
// Update script.js to:
fetch('YOUR_WORKER_URL', {
  method: 'POST',
  body: JSON.stringify({ name, email, message })
})
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Tips

- Optimize all images to under 500KB each
- Use WebP format where supported for faster loading
- Consider lazy-loading images for large portfolios
- Compress CSS and JavaScript for production

## SEO Optimization

Update these meta tags in `index.html`:
```html
<meta name="description" content="Your description here">
<meta name="keywords" content="3D visualization, real estate, VR">
<meta property="og:title" content="Your Name - Portfolio">
```

## License

© 2026 Nathan Bawa. All rights reserved.

## Support

For questions or issues, refer to the code comments or customize as needed.
