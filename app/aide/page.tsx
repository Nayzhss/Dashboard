import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { BackgroundOrbs } from "../components/BackgroundOrbs"

function Section({
  title,
  children,
  delay = 0,
}: {
  title: string
  children: React.ReactNode
  delay?: number
}) {
  return (
    <section
      style={{ animationDelay: `${delay}ms` }}
      className="animate-fade-up bg-[var(--surface)] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors"
    >
      <h2 className="font-semibold text-[var(--color-white)] mb-3">{title}</h2>
      <div className="space-y-2.5 text-sm text-[var(--text-2)] leading-relaxed">
        {children}
      </div>
    </section>
  )
}

export default function AidePage() {
  return (
    <main className="relative overflow-hidden min-h-screen bg-[var(--bg)] text-[var(--color-white)]">
      <BackgroundOrbs />

      <div className="relative z-10">
      <Header />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="animate-fade-up mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Aide</h1>
          <p className="text-sm text-[var(--text-4)] mt-1">
            Comment fonctionne le dashboard, en détail.
          </p>
        </div>

        <div className="space-y-5">
          <Section title="📦 Suivi automatique des livraisons" delay={0}>
            <p>
              Quand une commande a un transporteur reconnu (DHL, UPS, Chronopost,
              Colissimo, GLS, DPD, Mondial Relay, Relais Colis, Bpost, Amazon,
              FedEx) et un numéro de suivi, elle est inscrite automatiquement
              auprès d'un service de suivi multi-transporteurs.
            </p>
            <p>
              Une vérification automatique tourne <strong>une fois par jour</strong>{" "}
              (limite du plan d'hébergement gratuit). Si le transporteur indique
              que le colis est livré, le statut de la commande passe tout seul en{" "}
              <strong>« Livrée »</strong>, avec la vraie date de livraison
              renvoyée par le transporteur — donc jusqu'à 24h de décalage par
              rapport à la livraison réelle, pas du temps réel.
            </p>
            <p>
              Si le transporteur n'est pas dans la liste, ou si le numéro de
              suivi est mal renseigné, le passage en « Livrée » doit se faire à
              la main (clique sur le badge de statut dans le tableau).
            </p>
          </Section>

          <Section title="⏱ Délai" delay={60}>
            <p>La colonne « Délai » se calcule différemment selon où en est la commande :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Tant que rien n'est figé : nombre de jours depuis la date de paiement, mis à jour en continu.</li>
              <li>
                Si une <strong>date de réception</strong> est renseignée (dans le
                formulaire de modification de commande) : le délai se fige à
                « date de réception − date de paiement », et n'augmente plus.
              </li>
              <li>
                Sinon, si la commande passe en <strong>Remboursée</strong> ou{" "}
                <strong>Fail</strong> sans date de réception : le délai se fige
                au nombre de jours écoulés au moment du changement de statut.
              </li>
            </ul>
          </Section>

          <Section title="↩️ Commande en retour" delay={120}>
            <p>
              Passer le statut d'une commande sur <strong>« Retour »</strong>{" "}
              ouvre une popup qui demande le transporteur du retour et son
              numéro de suivi. Ces infos n'apparaissent que pour les commandes
              qui passent réellement par un retour — si ce n'est pas nécessaire,
              les colonnes « Transp. retour », « Suivi retour » et « Délai
              retour » restent vides et le délai normal continue de s'appliquer
              normalement, sans rien y changer.
            </p>
            <p>
              Le « Délai retour » s'incrémente d'un jour chaque jour à partir de
              l'expédition du retour, et se fige (comme le délai normal) une
              fois la commande marquée Remboursée ou Fail.
            </p>
          </Section>

          <Section title="🏬 Page Boutiques" delay={180}>
            <p>
              Liste toutes les boutiques connues, avec leurs méthodes, taux de
              réussite et un score de <strong>rentabilité</strong> calculé comme
              montant max ÷ délai moyen de la meilleure méthode (affiché en €/j).
              Le « Top 3 » en haut reprend simplement les 3 meilleurs scores.
            </p>
            <p>
              La barre de recherche propose les boutiques au fur et à mesure de
              la saisie, comme une auto-complétion classique — cliquer sur une
              suggestion ouvre directement sa fiche.
            </p>
            <p>
              Dans la fiche d'une boutique, l'icône ✎ permet de corriger ou
              compléter ses informations (téléphone, transporteurs, notes...)
              sans avoir à repasser par un import.
            </p>
          </Section>

          <Section title="🚚 Transporteur dans le formulaire de commande" delay={240}>
            <p>
              Le champ « Transporteur » propose une auto-complétion avec
              l'icône du transporteur. Une fois enregistré, le numéro de suivi
              devient cliquable dans le tableau et ouvre directement la page de
              suivi du transporteur correspondant.
            </p>
          </Section>

          <Section title="🎨 Thème" delay={300}>
            <p>
              Le bouton soleil/lune dans le header bascule entre thème sombre et
              clair. Le choix est mémorisé sur cet appareil.
            </p>
          </Section>

          <Section title="🔐 Connexion" delay={360}>
            <p>
              Connexion possible avec l'email ou le nom d'utilisateur choisi à
              l'inscription, dans le même champ — pas besoin de préciser lequel.
              L'icône en forme d'œil dans le champ mot de passe permet de
              vérifier sa saisie.
            </p>
          </Section>
        </div>
      </div>

      <Footer />
      </div>
    </main>
  )
}
