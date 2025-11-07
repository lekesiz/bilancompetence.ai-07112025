/**
 * France Travail API Integration
 * Documentation: https://francetravail.io/data/api
 * 
 * Note: L'API France Travail nécessite une authentification OAuth2.
 * Pour l'instant, nous utilisons des données simulées basées sur le référentiel ROME.
 */

export interface RomeCode {
  code: string;
  label: string;
  definition: string;
}

export interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  contractType: "CDI" | "CDD" | "Alternance" | "Interim" | "Independant";
  salary?: string;
  description: string;
  skills: string[];
  romeCode?: string;
  publishedAt: Date;
  url?: string;
}

export interface Training {
  id: string;
  title: string;
  provider: string;
  duration: string;
  location: string;
  description: string;
  targetJobs: string[];
  romeCode?: string;
  certifying: boolean;
  cpfEligible: boolean;
  url?: string;
}

/**
 * Référentiel ROME simplifié (Répertoire Opérationnel des Métiers et des Emplois)
 * Source: https://www.pole-emploi.fr/employeur/vos-recrutements/le-rome-et-les-fiches-metiers.html
 */
const ROME_CODES: Record<string, RomeCode> = {
  M1805: {
    code: "M1805",
    label: "Études et développement informatique",
    definition:
      "Conception, développement et mise au point de projets informatiques (systèmes d'information, logiciels, réseaux, bases de données, etc.)",
  },
  M1806: {
    code: "M1806",
    label: "Conseil et maîtrise d'ouvrage en systèmes d'information",
    definition:
      "Conseil en organisation et management des systèmes d'information, pilotage de projets informatiques",
  },
  M1803: {
    code: "M1803",
    label: "Direction des systèmes d'information",
    definition:
      "Définition et pilotage de la stratégie des systèmes d'information de l'entreprise",
  },
  E1103: {
    code: "E1103",
    label: "Communication",
    definition:
      "Conception et mise en œuvre d'actions de communication interne ou externe",
  },
  M1705: {
    code: "M1705",
    label: "Marketing",
    definition:
      "Élaboration et mise en œuvre de la stratégie marketing de l'entreprise",
  },
  M1707: {
    code: "M1707",
    label: "Stratégie commerciale",
    definition:
      "Définition et pilotage de la politique commerciale de l'entreprise",
  },
  K2111: {
    code: "K2111",
    label: "Formation professionnelle",
    definition: "Conception, organisation et animation de formations professionnelles",
  },
  M1402: {
    code: "M1402",
    label: "Conseil en organisation et management d'entreprise",
    definition:
      "Analyse et amélioration de l'organisation et du fonctionnement de l'entreprise",
  },
  M1502: {
    code: "M1502",
    label: "Development des ressources humaines",
    definition: "Gestion et développement des compétences et des carrières",
  },
  H1206: {
    code: "H1206",
    label: "Management et ingénierie études, recherche et développement industriel",
    definition:
      "Pilotage de projets de recherche et développement dans l'industrie",
  },
};

/**
 * Recherche de codes ROME par compétences
 */
export function searchRomeBySkills(skills: string[]): RomeCode[] {
  const results: RomeCode[] = [];
  const skillsLower = skills.map((s) => s.toLowerCase());

  // Mapping simplifié compétences -> ROME
  const skillToRome: Record<string, string[]> = {
    "développement": ["M1805"],
    "programmation": ["M1805"],
    "web": ["M1805"],
    "informatique": ["M1805", "M1806", "M1803"],
    "gestion de projet": ["M1806", "M1402"],
    "management": ["M1402", "M1502", "M1803"],
    "communication": ["E1103"],
    "marketing": ["M1705", "M1707"],
    "commercial": ["M1707"],
    "formation": ["K2111"],
    "rh": ["M1502"],
    "ressources humaines": ["M1502"],
    "conseil": ["M1402", "M1806"],
    "stratégie": ["M1707", "M1803"],
    "leadership": ["M1402", "M1502"],
  };

  const matchedCodes = new Set<string>();

  skillsLower.forEach((skill) => {
    Object.entries(skillToRome).forEach(([keyword, codes]) => {
      if (skill.includes(keyword)) {
        codes.forEach((code) => matchedCodes.add(code));
      }
    });
  });

  matchedCodes.forEach((code) => {
    if (ROME_CODES[code]) {
      results.push(ROME_CODES[code]);
    }
  });

  // Si aucun match, retourner quelques codes génériques
  if (results.length === 0) {
    return [ROME_CODES["M1402"], ROME_CODES["M1502"]];
  }

  return results;
}

/**
 * Obtenir les détails d'un code ROME
 */
export function getRomeDetails(code: string): RomeCode | null {
  return ROME_CODES[code] || null;
}

/**
 * Recherche d'offres d'emploi (simulé pour l'instant)
 * En production, utiliser l'API France Travail Offres d'emploi
 */
export async function searchJobOffers(params: {
  romeCode?: string;
  keywords?: string;
  location?: string;
  contractType?: string;
}): Promise<JobOffer[]> {
  // Simulation de données
  const mockOffers: JobOffer[] = [
    {
      id: "offer-1",
      title: "Développeur Full Stack",
      company: "TechCorp",
      location: "Paris (75)",
      contractType: "CDI",
      salary: "45-55K€",
      description:
        "Nous recherchons un développeur full stack pour rejoindre notre équipe. Vous travaillerez sur des projets innovants utilisant React, Node.js et PostgreSQL.",
      skills: ["React", "Node.js", "PostgreSQL", "TypeScript"],
      romeCode: "M1805",
      publishedAt: new Date(),
    },
    {
      id: "offer-2",
      title: "Chef de Projet Digital",
      company: "Digital Agency",
      location: "Lyon (69)",
      contractType: "CDI",
      salary: "50-60K€",
      description:
        "Pilotage de projets digitaux de A à Z. Vous serez en charge de la coordination des équipes et de la relation client.",
      skills: ["Gestion de projet", "Agile", "Communication", "Leadership"],
      romeCode: "M1806",
      publishedAt: new Date(),
    },
    {
      id: "offer-3",
      title: "Consultant en Stratégie",
      company: "Consulting Partners",
      location: "Paris (75)",
      contractType: "CDI",
      salary: "55-70K€",
      description:
        "Accompagnement de nos clients dans leur transformation digitale et organisationnelle.",
      skills: ["Conseil", "Stratégie", "Management", "Analyse"],
      romeCode: "M1402",
      publishedAt: new Date(),
    },
  ];

  // Filtrage basique
  let filtered = mockOffers;

  if (params.romeCode) {
    filtered = filtered.filter((offer) => offer.romeCode === params.romeCode);
  }

  if (params.keywords) {
    const keywords = params.keywords.toLowerCase();
    filtered = filtered.filter(
      (offer) =>
        offer.title.toLowerCase().includes(keywords) ||
        offer.description.toLowerCase().includes(keywords)
    );
  }

  if (params.location) {
    const location = params.location.toLowerCase();
    filtered = filtered.filter((offer) => offer.location.toLowerCase().includes(location));
  }

  if (params.contractType) {
    filtered = filtered.filter((offer) => offer.contractType === params.contractType);
  }

  return filtered;
}

/**
 * Recherche de formations (simulé pour l'instant)
 * En production, utiliser l'API France Travail Formations
 */
export async function searchTrainings(params: {
  romeCode?: string;
  keywords?: string;
  cpfOnly?: boolean;
}): Promise<Training[]> {
  const mockTrainings: Training[] = [
    {
      id: "training-1",
      title: "Développeur Web Full Stack",
      provider: "OpenClassrooms",
      duration: "6 mois",
      location: "En ligne",
      description:
        "Formation complète pour devenir développeur web full stack. Apprenez React, Node.js, et les bases de données.",
      targetJobs: ["Développeur Full Stack", "Développeur Web"],
      romeCode: "M1805",
      certifying: true,
      cpfEligible: true,
    },
    {
      id: "training-2",
      title: "Chef de Projet Digital",
      provider: "CEGOS",
      duration: "3 mois",
      location: "Paris / En ligne",
      description:
        "Formation certifiante pour maîtriser la gestion de projets digitaux avec les méthodes Agile.",
      targetJobs: ["Chef de Projet", "Product Owner"],
      romeCode: "M1806",
      certifying: true,
      cpfEligible: true,
    },
    {
      id: "training-3",
      title: "Consultant en Management",
      provider: "ESSEC Executive Education",
      duration: "4 mois",
      location: "Paris",
      description:
        "Programme executive pour développer vos compétences en conseil et management stratégique.",
      targetJobs: ["Consultant", "Manager"],
      romeCode: "M1402",
      certifying: true,
      cpfEligible: false,
    },
  ];

  let filtered = mockTrainings;

  if (params.romeCode) {
    filtered = filtered.filter((training) => training.romeCode === params.romeCode);
  }

  if (params.keywords) {
    const keywords = params.keywords.toLowerCase();
    filtered = filtered.filter(
      (training) =>
        training.title.toLowerCase().includes(keywords) ||
        training.description.toLowerCase().includes(keywords)
    );
  }

  if (params.cpfOnly) {
    filtered = filtered.filter((training) => training.cpfEligible);
  }

  return filtered;
}

/**
 * Obtenir les métiers associés à un code ROME
 */
export function getRelatedJobs(romeCode: string): string[] {
  const jobsByRome: Record<string, string[]> = {
    M1805: [
      "Développeur Full Stack",
      "Développeur Front-end",
      "Développeur Back-end",
      "Ingénieur logiciel",
      "Développeur mobile",
    ],
    M1806: [
      "Chef de projet MOA",
      "Product Owner",
      "Business Analyst",
      "Consultant fonctionnel",
      "Chef de projet digital",
    ],
    M1803: [
      "Directeur des systèmes d'information",
      "DSI",
      "Responsable informatique",
      "CTO",
      "Architecte SI",
    ],
    E1103: [
      "Chargé de communication",
      "Responsable communication",
      "Community Manager",
      "Attaché de presse",
    ],
    M1705: [
      "Chef de produit",
      "Responsable marketing",
      "Marketing Manager",
      "Chef de projet marketing",
    ],
    M1707: [
      "Directeur commercial",
      "Responsable développement commercial",
      "Business Developer",
      "Directeur des ventes",
    ],
    K2111: [
      "Formateur",
      "Responsable formation",
      "Ingénieur pédagogique",
      "Consultant en formation",
    ],
    M1402: [
      "Consultant en organisation",
      "Consultant en management",
      "Consultant stratégie",
      "Consultant transformation",
    ],
    M1502: [
      "Responsable RH",
      "DRH",
      "Chargé de développement RH",
      "Responsable recrutement",
      "Responsable formation",
    ],
  };

  return jobsByRome[romeCode] || [];
}
