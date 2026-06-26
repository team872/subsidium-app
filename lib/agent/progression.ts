import { CONFIG, SubsidiumConfig } from "./config";
import { User, Level } from "./types";

export function eligibleN1(user: User): boolean {
  return user.charteLightPassed === true && user.hasPaid === true;
}

export function eligibleN2(user: User, cfg: SubsidiumConfig = CONFIG): boolean {
  return user.level >= 1 && (user.autoEval20Score ?? -1) >= cfg.SEUIL_BADGE_N2;
}

export function applyTransitions(user: User, cfg: SubsidiumConfig = CONFIG): User {
  const u: User = { ...user, badges: [...user.badges] };
  if (u.level === 0 && eligibleN1(u)) {
    u.level = 1;
    u.canProposeIdeas = true;
    if (!u.badges.includes("N1")) u.badges.push("N1");
  }
  if (u.level === 1 && eligibleN2(u, cfg)) {
    u.level = 2;
    if (!u.badges.includes("N2")) u.badges.push("N2");
  }
  return u;
}

export function dateRetest(from: Date, cfg: SubsidiumConfig = CONFIG): string {
  const d = new Date(from.getTime());
  d.setDate(d.getDate() + cfg.X_JOURS_DELAI_RETEST);
  return d.toISOString();
}

export function newVisitor(id: string): User {
  return {
    id,
    level: 0 as Level,
    hasPaid: false,
    charteLightPassed: false,
    canProposeIdeas: false,
    badges: [],
  };
}
