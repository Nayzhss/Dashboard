export interface Carrier {
  slug: string
  name: string
  trackingUrl: (tracking: string) => string
  // 17track.net carrier code, used to auto-check delivery status (see lib/track17.ts)
  track17Code: number
}

export const CARRIERS: Carrier[] = [
  {
    slug: "dhl",
    name: "DHL",
    trackingUrl: (t) => `https://www.dhl.com/fr-fr/home/tracking.html?tracking-id=${encodeURIComponent(t)}&submit=1`,
    track17Code: 100001,
  },
  {
    slug: "ups",
    name: "UPS",
    trackingUrl: (t) => `https://www.ups.com/track?loc=fr_FR&tracknum=${encodeURIComponent(t)}`,
    track17Code: 100002,
  },
  {
    slug: "chronopost",
    name: "Chronopost",
    trackingUrl: (t) => `https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLT=${encodeURIComponent(t)}`,
    track17Code: 100273,
  },
  {
    slug: "colissimo",
    name: "Colissimo",
    trackingUrl: (t) => `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(t)}`,
    track17Code: 6051,
  },
  {
    slug: "gls",
    name: "GLS",
    trackingUrl: (t) => `https://gls-group.com/FR/fr/suivi-colis?match=${encodeURIComponent(t)}`,
    track17Code: 101272,
  },
  {
    // DPD's tracking form is a POST with a CSRF token, no GET deep-link
    // exists — this just opens the search page, number must be pasted in.
    slug: "dpd",
    name: "DPD",
    trackingUrl: () => `https://trace.dpd.fr/fr/trace`,
    track17Code: 100072,
  },
  {
    slug: "mondial-relay",
    name: "Mondial Relay",
    trackingUrl: (t) => `https://www.mondialrelay.fr/suivi-de-colis/?numeroExpedition=${encodeURIComponent(t)}`,
    track17Code: 100304,
  },
  {
    // Same as DPD: Relais Colis' tracking form is a POST with a CSRF
    // token, no GET deep-link exists.
    slug: "relais-colis",
    name: "Relais Colis",
    trackingUrl: () => `https://www.relaiscolis.com/suivi-de-colis/`,
    track17Code: 100461,
  },
  {
    slug: "bpost",
    name: "Bpost",
    trackingUrl: (t) => `https://track.bpost.cloud/btr/web/#/search?itemCode=${encodeURIComponent(t)}`,
    track17Code: 2061,
  },
  {
    slug: "amazon",
    name: "Amazon",
    trackingUrl: (t) => `https://track.amazon.com/tracking/${encodeURIComponent(t)}`,
    track17Code: 101001,
  },
  {
    slug: "fedex",
    name: "FedEx",
    trackingUrl: (t) => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(t)}`,
    track17Code: 100854,
  },
]

export function slugifyCarrier(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function getCarrier(name: string) {
  const slug = slugifyCarrier(name)
  return CARRIERS.find((c) => c.slug === slug)
}
