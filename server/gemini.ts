import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Generate career recommendations based on skills assessment
 */
export async function generateCareerRecommendations(data: {
  skills: string[];
  interests: string[];
  experience: string;
  goals: string;
}): Promise<{
  recommendations: Array<{
    title: string;
    description: string;
    matchScore: number;
    requiredSkills: string[];
    trainingNeeded: string[];
  }>;
  summary: string;
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `En tant qu'expert en orientation professionnelle, analysez le profil suivant et générez des recommandations de carrière personnalisées en français :

Compétences actuelles : ${data.skills.join(", ")}
Centres d'intérêt : ${data.interests.join(", ")}
Expérience professionnelle : ${data.experience}
Objectifs de carrière : ${data.goals}

Générez une réponse structurée au format JSON avec :
1. Un tableau "recommendations" contenant 3-5 recommandations de métiers/carrières avec :
   - title : nom du métier
   - description : description détaillée (2-3 phrases)
   - matchScore : score de correspondance (0-100)
   - requiredSkills : compétences requises (tableau)
   - trainingNeeded : formations recommandées (tableau)
2. Un champ "summary" avec une synthèse générale (2-3 paragraphes)

Répondez UNIQUEMENT avec du JSON valide, sans markdown ni texte supplémentaire.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean the response (remove markdown code blocks if present)
    const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const parsed = JSON.parse(cleanedText);
    return parsed;
  } catch (error) {
    console.error("Error generating career recommendations:", error);
    throw new Error("Failed to generate career recommendations");
  }
}

/**
 * Generate a professional skills assessment analysis
 */
export async function analyzeSkillsAssessment(data: {
  selfAssessment: Record<string, number>; // skill -> rating (1-5)
  professionalBackground: string;
  achievements: string[];
}): Promise<{
  strengths: string[];
  areasForImprovement: string[];
  developmentPlan: string;
  careerPaths: string[];
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const skillsText = Object.entries(data.selfAssessment)
    .map(([skill, rating]) => `${skill}: ${rating}/5`)
    .join("\n");

  const prompt = `En tant qu'expert en développement professionnel, analysez cette auto-évaluation de compétences :

Auto-évaluation :
${skillsText}

Parcours professionnel : ${data.professionalBackground}
Réalisations : ${data.achievements.join(", ")}

Générez une analyse structurée au format JSON avec :
1. "strengths" : tableau des points forts identifiés (3-5 items)
2. "areasForImprovement" : tableau des axes d'amélioration (3-5 items)
3. "developmentPlan" : plan de développement détaillé (texte, 2-3 paragraphes)
4. "careerPaths" : tableau de pistes de carrière possibles (3-5 items)

Répondez UNIQUEMENT avec du JSON valide, sans markdown ni texte supplémentaire.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const parsed = JSON.parse(cleanedText);
    return parsed;
  } catch (error) {
    console.error("Error analyzing skills assessment:", error);
    throw new Error("Failed to analyze skills assessment");
  }
}

/**
 * Generate a personalized action plan
 */
export async function generateActionPlan(data: {
  currentSituation: string;
  goals: string[];
  constraints: string[];
  timeline: string;
}): Promise<{
  shortTermActions: Array<{ action: string; deadline: string; priority: string }>;
  mediumTermActions: Array<{ action: string; deadline: string; priority: string }>;
  longTermActions: Array<{ action: string; deadline: string; priority: string }>;
  keyMilestones: string[];
  resources: string[];
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `En tant qu'expert en accompagnement professionnel, créez un plan d'action personnalisé :

Situation actuelle : ${data.currentSituation}
Objectifs : ${data.goals.join(", ")}
Contraintes : ${data.constraints.join(", ")}
Horizon temporel : ${data.timeline}

Générez un plan d'action structuré au format JSON avec :
1. "shortTermActions" : actions à court terme (0-3 mois) - tableau d'objets avec action, deadline, priority
2. "mediumTermActions" : actions à moyen terme (3-12 mois) - tableau d'objets avec action, deadline, priority
3. "longTermActions" : actions à long terme (12+ mois) - tableau d'objets avec action, deadline, priority
4. "keyMilestones" : jalons clés à atteindre (tableau de strings)
5. "resources" : ressources nécessaires (formations, contacts, outils) - tableau de strings

Répondez UNIQUEMENT avec du JSON valide, sans markdown ni texte supplémentaire.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const parsed = JSON.parse(cleanedText);
    return parsed;
  } catch (error) {
    console.error("Error generating action plan:", error);
    throw new Error("Failed to generate action plan");
  }
}

/**
 * Generate a synthesis document for the bilan
 */
export async function generateBilanSynthesis(data: {
  beneficiaryName: string;
  objectives: string;
  skillsAssessment: any;
  recommendations: any;
  actionPlan: any;
  sessions: Array<{ title: string; date: string; notes?: string }>;
}): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `En tant qu'expert en bilan de compétences, rédigez une synthèse professionnelle complète pour :

Bénéficiaire : ${data.beneficiaryName}
Objectifs du bilan : ${data.objectives}

Évaluation des compétences : ${JSON.stringify(data.skillsAssessment, null, 2)}
Recommandations : ${JSON.stringify(data.recommendations, null, 2)}
Plan d'action : ${JSON.stringify(data.actionPlan, null, 2)}

Sessions réalisées :
${data.sessions.map((s) => `- ${s.title} (${s.date})${s.notes ? ": " + s.notes : ""}`).join("\n")}

Rédigez une synthèse professionnelle structurée en markdown avec :
1. Introduction et contexte
2. Analyse des compétences et points forts
3. Axes de développement identifiés
4. Recommandations de carrière
5. Plan d'action détaillé
6. Conclusion et perspectives

La synthèse doit être professionnelle, encourageante et orientée action. Format markdown avec titres, listes et paragraphes bien structurés.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating bilan synthesis:", error);
    throw new Error("Failed to generate bilan synthesis");
  }
}
