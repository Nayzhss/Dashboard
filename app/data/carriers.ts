export interface Carrier {
  slug: string
  name: string
  trackingUrl: (tracking: string) => string
}

export const CARRIERS: Carrier[] = [
  {
    slug: "dhl",
    name: "DHL",
    trackingUrl: (t) => `https://www.dhl.com/fr-fr/home/tracking.html?tracking-id=${encodeURIComponent(t)}`,
  },
  {
    slug: "ups",
    name: "UPS",
    trackingUrl: (t) => `https://www.ups.com/track?loc=fr_FR&tracknum=${encodeURIComponent(t)}`,
  },
  {
    slug: "chronopost",
    name: "Chronopost",
    trackingUrl: (t) => `https://www.chronopost.fr/tracking-no-cms/suivi-colis?listeNumerosLT=${encodeURIComponent(t)}`,
  },
  {
    slug: "colissimo",
    name: "Colissimo",
    trackingUrl: (t) => `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(t)}`,
  },
  {
    slug: "gls",
    name: "GLS",
    trackingUrl: (t) => `https://gls-group.com/FR/fr/suivi-colis?match=${encodeURIComponent(t)}`,
  },
  {
    slug: "dpd",
    name: "DPD",
    trackingUrl: (t) => `https://trace.dpd.fr/fr/trace/${encodeURIComponent(t)}`,
  },
  {
    slug: "mondial-relay",
    name: "Mondial Relay",
    trackingUrl: (t) => `https://www.mondialrelay.fr/suivi-de-colis/?numeroExpedition=${encodeURIComponent(t)}`,
  },
  {
    slug: "relais-colis",
    name: "Relais Colis",
    trackingUrl: (t) => `https://www.relaiscolis.com/suivi-de-colis/?numColis=${encodeURIComponent(t)}`,
  },
  {
    slug: "bpost",
    name: "Bpost",
    trackingUrl: (t) => `https://track.bpost.cloud/btr/web/#/search?itemCode=${encodeURIComponent(t)}`,
  },
  {
    slug: "amazon",
    name: "Amazon",
    trackingUrl: (t) => `https://track.amazon.com/tracking/${encodeURIComponent(t)}`,
  },
  {
    slug: "fedex",
    name: "FedEx",
    trackingUrl: (t) => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(t)}`,
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
