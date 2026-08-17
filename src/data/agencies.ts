/**
 * Offre de sous-traitance et de renfort technique pour les agences, les
 * studios et les ESN.
 *
 * Rien n'est affirmé ici qui ne soit vérifiable. En particulier :
 *
 *   • aucune antériorité n'est revendiquée — l'offre décrit une capacité, pas
 *     un historique de missions, et ne mentionne ni client ni volume ;
 *   • les outils cités sont ceux réellement utilisés. GitHub est le seul
 *     nommé : le reste se formule comme une adaptation à l'organisation du
 *     donneur d'ordre, ce qui est vrai, plutôt que par une liste de logos ;
 *   • les technologies listées dans `capabilities` sont soit attestées par un
 *     projet du portfolio, soit confirmées par l'équipe. N'en ajoutez aucune
 *     sans cette contrepartie.
 */

export type Mode = {
  readonly id: string;
  readonly title: string;
  /** Ce que l'agence achète, en une phrase. */
  readonly summary: string;
};

export const modes: readonly Mode[] = [
  {
    id: 'renfort',
    title: 'Renfort ponctuel',
    summary:
      'Une fonctionnalité, un sprint, quelques semaines de développement. Nous prenons un lot de travail identifié et nous le livrons.',
  },
  {
    id: 'projet',
    title: 'Projet complet',
    summary:
      'Vous vendez, vous cadrez, vous pilotez la relation. Nous prenons toute la partie technique, du schéma de données à la mise en production.',
  },
  {
    id: 'marque-blanche',
    title: 'Marque blanche',
    summary:
      'Vous gardez la relation avec votre client final. Nous restons en retrait : aucun contact direct, aucune signature dans les livrables.',
  },
  {
    id: 'maintenance',
    title: 'Maintenance et évolution',
    summary:
      'Continuer à développer un produit déjà en ligne : corrections, montées de version, nouvelles fonctionnalités, dette technique.',
  },
  {
    id: 'reprise',
    title: 'Reprise de projet',
    summary:
      'Une application héritée, un prestataire parti, une base à assainir. Nous auditons, nous stabilisons, puis le développement repart.',
  },
];

export type Step = {
  readonly title: string;
  readonly summary: string;
};

export const steps: readonly Step[] = [
  {
    title: 'Vous nous présentez le besoin',
    summary:
      'Brief, spécifications, maquettes, dépôt existant — ou simple description au téléphone.',
  },
  {
    title: 'Nous cadrons la solution',
    summary:
      'Stack, architecture, découpage en lots, estimation et planning. Écrit, avant la première ligne de code.',
  },
  {
    title: 'Nous développons',
    summary:
      'Dans vos outils ou les nôtres, selon votre organisation. Vous suivez l’avancement en continu.',
  },
  {
    title: 'Vous gardez votre client',
    summary:
      'La relation commerciale reste la vôtre. Nous pouvons rester entièrement invisibles.',
  },
  {
    title: 'Livraison',
    summary:
      'Pull requests relisables, environnement de préproduction, tests, documentation et passation.',
  },
];

export type Reason = {
  readonly title: string;
  readonly body: string;
};

export const reasons: readonly Reason[] = [
  {
    title: 'Marque blanche',
    body: 'Votre client reste votre client. Nous n’allons jamais le chercher, ni pendant la mission, ni après.',
  },
  {
    title: 'Communication directe',
    body: 'Vous parlez aux personnes qui écrivent le code. Aucun commercial entre votre chef de projet et nous.',
  },
  {
    title: 'Intégration à votre workflow',
    body: 'Nous travaillons sur GitHub, et nous nous adaptons à votre suivi de projet et à votre canal d’échange plutôt que d’imposer les nôtres.',
  },
  {
    title: 'Code maintenable',
    body: 'Tests, documentation, conventions et pull requests lisibles : ce que nous livrons doit pouvoir être repris sans nous.',
  },
  {
    title: 'Flexibilité',
    body: 'Un lot ponctuel ou une collaboration récurrente. Au forfait quand le périmètre est clair, au temps passé quand il ne l’est pas encore.',
  },
  {
    title: 'Stack moderne',
    body: 'React, Next.js, TypeScript, Node.js, Python, PostgreSQL, et l’intégration de modèles de langage quand elle sert réellement le produit.',
  },
];

export type Capability = {
  readonly id: string;
  readonly title: string;
  /** Technologies et livrables réellement pratiqués. Voir l'en-tête du fichier. */
  readonly items: readonly string[];
};

export const capabilities: readonly Capability[] = [
  {
    id: 'frontend',
    title: 'Frontend',
    items: ['React', 'Next.js', 'TypeScript'],
  },
  {
    id: 'backend',
    title: 'Backend',
    items: ['Node.js', 'Express', 'Python', 'API REST', 'PostgreSQL', 'Prisma'],
  },
  {
    id: 'ia',
    title: 'IA et automatisation',
    items: ['LLM', 'Agents IA', 'RAG', 'Intégrations API', 'Automatisation'],
  },
  {
    id: 'produit',
    title: 'Produit',
    items: [
      'Applications web',
      'Tableaux de bord',
      'SaaS',
      'Outils internes',
      'E-commerce',
      'Automatisation métier',
    ],
  },
];
