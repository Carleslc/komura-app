const BRAND = 'Komura';

export default {
  title: BRAND,
  titleTemplate: title => (title !== BRAND ? `${title} | ${BRAND}` : BRAND),
  meta: {
    description: { name: 'description', content: 'Kindly Network' },
    og_description: { property: 'og:description', content: 'Kindly Network' },
    site_name: { property: 'og:site_name', content: 'Komura' },
    image: {
      property: 'og:image',
      content: `${window.location.origin}/statics/app-logo-128x128.png`
    }
  }
};
