# Changelog

All notable changes to the India vs UAE Tax Residency Calculator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2025-11-06

### Added
- **How It Works** educational section explaining the calculation methodology
  - Tax residency determination process
  - India tax status categories breakdown
  - UAE TRC requirements explanation
  - Cost-benefit analysis methodology
  - DTAA overview
- **Key Definitions** section with 6 essential tax terms:
  - NRI (Non-Resident Indian)
  - RNOR (Resident but Not Ordinarily Resident)
  - TRC (Tax Residency Certificate)
  - DTAA (Double Tax Avoidance Agreement)
  - 183-Day Rule
  - Global Income
- Mobile-specific meta tags for better PWA experience
  - `mobile-web-app-capable`
  - `apple-mobile-web-app-capable`
  - `apple-mobile-web-app-status-bar-style`
  - `apple-mobile-web-app-title`
- Enhanced YMYL-compliant disclaimer in footer
  - Comprehensive legal disclaimer
  - Data sources citation
  - Links to official tax authorities (Indian Income Tax Department, UAE Federal Tax Authority)
  - Last updated date
  - Limitation of liability statement

### Changed
- Enhanced heading structure with proper h2/h3 hierarchy for better SEO
- Upgraded footer disclaimer to meet YMYL (Your Money Your Life) standards
- Updated `robots.txt` to disallow `/api/` routes and `*.json` files
- Updated `sitemap.xml` changefreq from weekly to monthly

### Improved
- Content expanded to 1500+ words for better SEO performance
- Enhanced E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness)
- Semantic HTML improvements with proper aria-labels
- Mobile responsiveness and accessibility

## [1.1.0] - 2025-11-06

### Added
- Comprehensive SEO meta tags
  - Title and description meta tags
  - Keywords meta tag with relevant tax terms
  - Author meta tag
  - Canonical URL
  - Robots meta tag
- Open Graph meta tags for social media sharing
  - Facebook/LinkedIn optimization
  - Social media preview support
- Twitter Card meta tags for Twitter/X sharing
  - Large image card support
  - Creator attribution
- Structured data (JSON-LD)
  - WebApplication schema with feature list
  - FAQPage schema with 5 common questions
- FAQ section on the main page with 6 frequently asked questions
  - UAE tax residency requirements
  - NRI status explanation
  - RNOR status explanation
  - Dual residency considerations
  - TRC requirements
  - 183-day rule explanation
- Google Search Console verification meta tag
- `robots.txt` file for search engine crawlers
- `sitemap.xml` for better search engine indexing
- SEO Product Requirements Document (SEO-PRD.md)

### Changed
- Updated all placeholder URLs to production domain
- Enhanced page description with better keyword targeting

## [1.0.0] - 2025-11-06

### Added
- Initial release of India vs UAE Tax Residency Calculator
- Interactive calculator with real-time validation
- Input fields for all relevant parameters:
  - Days in UAE (with 190+ day safe zone recommendation)
  - Days in India (with NRI status guidance)
  - Monthly cost of living in UAE (AED)
  - Monthly cost of living in India (INR)
  - AED to INR exchange rate
  - Flight costs
  - One-time relocation costs
  - Effective Indian tax rate
- Tax residency status determination
  - NRI status (< 111 days in India)
  - RNOR status (111-181 days in India)
  - Resident status (182+ days in India)
  - UAE TRC eligibility (183+ days in UAE)
- Summary card showing:
  - Days abroad calculation
  - India tax residency status
  - UAE tax residency status
  - Total incremental cost
  - Annual income breakeven point
- Sensitivity analysis table
  - Analysis across different income levels (₹10L to ₹2Cr)
  - Tax savings calculation
  - Net gain/loss per income level
  - Color-coded results (profit in green, loss in red)
- Modern dark-themed UI with Tailwind CSS
  - Gradient text effects
  - Responsive design for mobile and desktop
  - Card-based layout
  - Clean, professional aesthetic
- Real-time input validation with error messages
- Detailed input field descriptions and tooltips
- Disclaimer about informational nature of the calculator

### Technical
- Built with React 19.2.0
- TypeScript for type safety
- Tailwind CSS for styling
- Vite for build tooling
- Deployed on Render.com

---

## Version History Summary

- **v1.2.0** - Phase 1 & 2 SEO PRD implementation (Nov 6, 2025)
- **v1.1.0** - Initial SEO optimizations and structured data (Nov 6, 2025)
- **v1.0.0** - Initial calculator release (Nov 6, 2025)

---

## Contributing

If you find any issues or have suggestions for improvements, please open an issue on GitHub.

## Author

Created by [Shounak Shetty](https://x.com/shawnpwn) (@shawnpwn)

## License

This project is open source and available for educational purposes.
