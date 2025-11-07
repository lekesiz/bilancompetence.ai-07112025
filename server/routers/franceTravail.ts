import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  searchRomeBySkills,
  getRomeDetails,
  searchJobOffers,
  searchTrainings,
  getRelatedJobs,
} from "../franceTravail";

export const franceTravailRouter = router({
  /**
   * Recherche de codes ROME par compétences
   */
  searchRome: publicProcedure
    .input(
      z.object({
        skills: z.array(z.string()),
      })
    )
    .query(async ({ input }) => {
      return searchRomeBySkills(input.skills);
    }),

  /**
   * Obtenir les détails d'un code ROME
   */
  getRomeDetails: publicProcedure
    .input(
      z.object({
        code: z.string(),
      })
    )
    .query(async ({ input }) => {
      const details = getRomeDetails(input.code);
      if (!details) {
        throw new Error(`Code ROME ${input.code} non trouvé`);
      }
      return details;
    }),

  /**
   * Recherche d'offres d'emploi
   */
  searchJobs: publicProcedure
    .input(
      z.object({
        romeCode: z.string().optional(),
        keywords: z.string().optional(),
        location: z.string().optional(),
        contractType: z.enum(["CDI", "CDD", "Alternance", "Interim", "Independant"]).optional(),
      })
    )
    .query(async ({ input }) => {
      return searchJobOffers(input);
    }),

  /**
   * Recherche de formations
   */
  searchTrainings: publicProcedure
    .input(
      z.object({
        romeCode: z.string().optional(),
        keywords: z.string().optional(),
        cpfOnly: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      return searchTrainings(input);
    }),

  /**
   * Obtenir les métiers associés à un code ROME
   */
  getRelatedJobs: publicProcedure
    .input(
      z.object({
        romeCode: z.string(),
      })
    )
    .query(async ({ input }) => {
      return getRelatedJobs(input.romeCode);
    }),
});
