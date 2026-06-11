import { Request, Response, NextFunction } from 'express'

// Plan feature limits
export const PLAN_FEATURES = {
  free: {
    maxDiagrams: 5,
    aiGenerationsPerDay: 10,
    collaborationEnabled: false,
    exportFormats: ['png', 'json'],
    learningTracksUnlocked: ['fundamentals'],
    interviewChallengesPerDay: 2,
    simulationEnabled: true,
  },
  pro: {
    maxDiagrams: Infinity,
    aiGenerationsPerDay: 200,
    collaborationEnabled: true,
    exportFormats: ['png', 'pdf', 'json', 'terraform', 'yaml', 'gif'],
    learningTracksUnlocked: 'all',
    interviewChallengesPerDay: Infinity,
    simulationEnabled: true,
  },
  team: {
    maxDiagrams: Infinity,
    aiGenerationsPerDay: 1000,
    collaborationEnabled: true,
    exportFormats: 'all',
    learningTracksUnlocked: 'all',
    interviewChallengesPerDay: Infinity,
    simulationEnabled: true,
  }
} as const

export type PlanFeature = keyof typeof PLAN_FEATURES.free

// Middleware factory — add to any route that needs plan checking
// Currently PASSES ALL — billing logic added Sprint 10
// But infrastructure is in place NOW so we don't retrofit later
export const requirePlan = (minimumPlan: 'free' | 'pro' | 'team') => {
  return async (req: any, res: Response, next: NextFunction) => {
    // Sprint 10: uncomment this block when billing is live
    // const userPlan = req.user?.plan || 'free'
    // const planOrder = { free: 0, pro: 1, team: 2 }
    // if (planOrder[userPlan] < planOrder[minimumPlan]) {
    //   return res.status(403).json({
    //     error: 'Upgrade required',
    //     requiredPlan: minimumPlan,
    //     currentPlan: userPlan,
    //     upgradeUrl: '/settings#upgrade'
    //   })
    // }
    next() // Always passes for now
  }
}

// Check feature limits (diagram count, AI calls etc)
export const checkLimit = (feature: PlanFeature) => {
  return async (req: any, res: Response, next: NextFunction) => {
    // Sprint 10: add actual counting logic here
    // For now just passes through
    next()
  }
}
