import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_URL = 'https://www.ericaspanks.com'
const DEFAULT_TITLE = 'Erica Spanks - Confident Fashion for Women'
const DEFAULT_DESCRIPTION = 'Discover confident, sexy, and comfortable fashion at Erica Spanks. Shop the latest women\'s clothing designed to make you feel unstoppable.'

const pageMetadata: Record<string, { title: string; description: string }> = {
  '/about': {
    title: 'About Erica Spanks',
    description: 'Learn about Erica Spanks and our confident fashion for women.',
  },
  '/contact': {
    title: 'Contact Erica Spanks',
    description: 'Get in touch with Erica Spanks for product and customer support enquiries.',
  },
  '/faq': {
    title: 'Frequently Asked Questions | Erica Spanks',
    description: 'Find answers to common Erica Spanks shopping, delivery, and returns questions.',
  },
  '/lookbook': {
    title: 'Lookbook | Erica Spanks',
    description: 'Explore the latest Erica Spanks looks and confident fashion inspiration.',
  },
  '/products': {
    title: 'Shop Women\'s Fashion | Erica Spanks',
    description: 'Shop the latest women\'s clothing from Erica Spanks.',
  },
  '/returns': {
    title: 'Returns | Erica Spanks',
    description: 'Read the Erica Spanks returns policy.',
  },
  '/shipping': {
    title: 'Shipping | Erica Spanks',
    description: 'View Erica Spanks delivery zones and shipping information.',
  },
  '/size-guide': {
    title: 'Size Guide | Erica Spanks',
    description: 'Find your best fit with the Erica Spanks size guide.',
  },
}

const noIndexPaths = new Set([
  '/account-settings',
  '/cart',
  '/checkout',
  '/invoices',
  '/login',
  '/profile',
  '/register',
  '/search',
  '/wishlist',
])

const setMeta = (selector: string, attribute: 'name' | 'property', value: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, value)
    document.head.appendChild(element)
  }
  element.content = content
}

const Seo = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    const metadata = pageMetadata[pathname] ?? {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
    }
    const canonicalUrl = `${SITE_URL}${pathname === '/' ? '/' : pathname}`
    const noIndex = pathname.startsWith('/admin/') || pathname.startsWith('/order/') || pathname.startsWith('/orders/') || noIndexPaths.has(pathname)

    document.title = metadata.title
    setMeta('meta[name="description"]', 'name', 'description', metadata.description)
    setMeta('meta[property="og:title"]', 'property', 'og:title', metadata.title)
    setMeta('meta[property="og:description"]', 'property', 'og:description', metadata.description)
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl)
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', metadata.title)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', metadata.description)
    setMeta('meta[name="robots"]', 'name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow')

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalUrl
  }, [pathname])

  return null
}

export default Seo
