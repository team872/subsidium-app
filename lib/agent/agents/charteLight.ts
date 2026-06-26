import { LLMClient, ChatMessage, parseJsonResponse } from "../llm";
import { agent1SystemPrompt } from "../prompts";
import { CharteLightResult, User } from "../types";
import { CONFIG, SubsidiumConfig } from "../config";
import { dateRetest, applyTransitions } from "../progression";

export interface CharteLightOutcome {
  result: CharteLightResult;
  user: User;
  parcoursAlignementDeclenche: boolean;
}

export async function runCharteLight(
  llm: LLMClient,
  user: User,
  transcript: string,
  now: Date = new Date(),
  cfg: SubsidiumConfig = CONFIG
): Promise<CharteLightOutcome> {
  const messages: ChatMessage[] = [
    { role: "system", content: agent1SystemPrompt() },
    { role: "user", content: transcript },
  ];
  const raw = await llm.complete(messages);
  const result = parseJsonResponse<CharteLightResult>(raw);

  let u: User = { ...user, charteLightLastAttempt: now.toISOString() };
  let parcours = false;

  if (result.verdict === "valide") {
    u.charteLightPassed = true;
    u.canProposeIdeas = true;
    u = applyTransitions(u, cfg);
  } else {
    u.charteLightPassed = false;
    u.canProposeIdeas = false;
    parcours = true;
    result.retest_autorise_le = result.retest_autorise_le ?? dateRetest(now, cfg);
  }

  return { result, user: u, parcoursAlignementDeclenche: parcours };
}
