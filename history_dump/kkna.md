# Portfolio Setup Checklist

Follow these steps to complete your portfolio website:

## 1. Add Your Images
- [ ] Add 6 portfolio project images to `/projects/` folder
  - Recommended: 1200x1200px, optimized for web
  - Formats: JPG, PNG, or WebP
  
- [ ] Add your profile photo to `/about/` folder
  - Recommended: 1000x1200px portrait
  - Optimized for web

## 2. Update Personal Information

In **index.html**, update:
- [ ] Your name (appears in navbar, hero, title)
- [ ] Your subtitle/niche description
- [ ] About section bio (2-3 paragraphs)
- [ ] Your email address in Contact section
- [ ] Social media links (Instagram, TikTok, LinkedIn)

## 3. Customize Your Portfolio Projects

For each work item in the grid:
- [ ] Update project titles
- [ ] Update project descriptions
- [ ] Ensure correct category (real-estate, characters, vr, motion)
- [ ] Add hover descriptions

## 4. Update Services Section

Edit the three service offerings to match what you provide:
- [ ] Service 1 title & description
- [ ] Service 2 title & description
- [ ] Service 3 title & description

## 5. Customize Styling (Optional)

In **styles.css**, modify to match your brand:
- [ ] Primary colors (currently cyan #00d4ff)
- [ ] Font families (optional - currently system fonts)
- [ ] Section spacing/padding
- [ ] Border radius values

## 6. Set Up Email Functionality (Optional)

To make the contact form actually send emails:
- [ ] Choose email service (Formspree, Netlify Forms, SendGrid, etc.)
- [ ] Update form submission in `script.js`
- [ ] Add form action attribute in `index.html` if using service

**Quick options:**
- **Formspree**: Add form action: `https://formspree.io/f/YOUR_FORM_ID`
- **Netlify Forms**: Deploy to Netlify, add `netlify` attribute to form
- **Email.js**: Include library, update JavaScript

## 7. SEO Optimization

In **index.html** `<head>`:
- [ ] Update meta description
- [ ] Add meta keywords
- [ ] Update page title
- [ ] Add Open Graph tags for social sharing

Example:
```html
<meta name="description" content="3D Artist specializing in real estate visualization and VR environments">
<meta property="og:image" content="projects/project-1.jpg">
```

## 8. Testing

- [ ] Open index.html in browser (locally)
- [ ] Test all navigation links
- [ ] Test portfolio filters (All, Real Estate, Characters, etc.)
- [ ] Test responsive design (resize browser, check mobile)
- [ ] Test contact form
- [ ] Check all image loading

## 9. Deployment Options

Choose one to publish your site:
- [ ] **GitHub Pages** - Free, automatic deployment
- [ ] **Netlify** - Free tier with form support
- [ ] **Vercel** - Fast, great for portfolios
- [ ] **Traditional Hosting** - cPanel, Bluehost, etc.
- [ ] **AWS/Firebase** - More complex, scalable

## 10. Final Polish

- [ ] Proofread all copy and bio
- [ ] Verify all links work
- [ ] Test on different devices (phone, tablet, desktop)
- [ ] Check loading speed (use Lighthouse)
- [ ] Share with friends for feedback

---

## File Structure Overview

```
Urbanstage3Dweb/
├── index.html           ← Main webpage (edit content here)
├── styles.css           ← All styling (edit colors/fonts here)
├── script.js            ← Functionality & interactions
├── README.md            ← Full documentation
├── IMAGE_GUIDE.md       ← Image sizing tips
├── SETUP_CHECKLIST.md   ← This file
├── projects/            ← Your 6 portfolio images
│   ├── project-1.jpg
│   ├── project-2.jpg
│   └── ... (6 total)
└── about/
    └── photo.jpg        ← Your profile photo
```

## Need Help?

**Viewing locally:**
- Option 1: Double-click `index.html` in folder
- Option 2: Right-click `index.html` → Open with → Browser
- Option 3: Use VS Code Live Server extension

**Making changes:**
- Edit `.html` for content (text, links)
- Edit `.css` for styling (colors, fonts, spacing)
- Edit `.js` for interactions (if advanced)

**Common Questions:**
- Can I change colors? Yes, edit `:root` section in styles.css
- How do I add more projects? Duplicate a work-item div in index.html
- Can I use different fonts? Yes, add font URLs to styles.css
- How do I add animations? CSS animations are already included!

---

Mark off items as you complete them. Good luck! 🚀
