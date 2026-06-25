import { query, ensureDb } from "./db";
import { setLabellisee } from "./orgData";

// Module Audits organisations — workflow de labellisation :
//  demande d'audit + justificatifs → paiement (simulé pour l'instant) → instruction admin →
//  validation (labellise l'organisation) ou refus. File d'attente côté admin.

export type AuditStatut = "a_payer" | "en_instruction" | "valide" | "refuse";
export type AuditDTO = { id: number; org_id: number; statut: AuditStatut; documents: string; paye: boolean; decision: string | null; created_at: string; decided_at: string | null };
export type PendingAudit = AuditDTO & { org_name: string; requester: string };

let ready: Promise<void> | null = null;
export function ensureAudits(): Promise<void> {
  if (!ready) ready = init();
  return ready;
}
async function init() {
  await ensureDb();
  await query(`
    CREATE TABLE IF NOT EXISTS org_audits (
      id SERIAL PRIMARY KEY,
      org_id INT REFERENCES organisations(id) ON DELETE CASCADE,
      requested_by INT REFERENCES users(id) ON DELETE SET NULL,
      documents TEXT,
      statut TEXT DEFAULT 'a_payer',
      paye BOOLEAN DEFAULT FALSE,
      decision TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      decided_at TIMESTAMPTZ
    );
  `);
}

function mapAudit(r: any): AuditDTO {
  return { id: r.id, org_id: r.org_id, statut: r.statut, documents: r.documents || "", paye: !!r.paye, decision: r.decision || null, created_at: r.created_at, decided_at: r.decided_at || null };
}

export async function getAuditForOrg(orgId: number): Promise<AuditDTO | null> {
  await ensureAudits();
  const rows = await query<any>(`SELECT * FROM org_audits WHERE org_id=$1 ORDER BY id DESC LIMIT 1`, [orgId]);
  return rows[0] ? mapAudit(rows[0]) : null;
}
export async function requestAudit(orgId: number, userId: number, documents: string): Promise<AuditDTO> {
  await ensureAudits();
  const cur = await getAuditForOrg(orgId);
  if (cur && cur.statut !== "refuse") return cur; // une demande est déjà en cours
  const rows = await query<any>(`INSERT INTO org_audits (org_id,requested_by,documents,statut) VALUES ($1,$2,$3,'a_payer') RETURNING *`, [orgId, userId, documents]);
  return mapAudit(rows[0]);
}
export async function payAudit(auditId: number): Promise<void> {
  await ensureAudits();
  await query(`UPDATE org_audits SET paye=TRUE, statut='en_instruction' WHERE id=$1 AND statut='a_payer'`, [auditId]);
}
export async function getAuditOrgId(auditId: number): Promise<number | null> {
  await ensureAudits();
  const rows = await query<{ org_id: number }>(`SELECT org_id FROM org_audits WHERE id=$1`, [auditId]);
  return rows[0]?.org_id ?? null;
}
export async function listPendingAudits(): Promise<PendingAudit[]> {
  await ensureAudits();
  const rows = await query<any>(
    `SELECT a.*, o.name AS org_name,
            COALESCE(NULLIF(TRIM(CONCAT(u.prenom,' ',u.nom)),''), u.email, '—') AS requester
     FROM org_audits a JOIN organisations o ON o.id=a.org_id LEFT JOIN users u ON u.id=a.requested_by
     WHERE a.statut='en_instruction' ORDER BY a.created_at ASC`
  );
  return rows.map((r) => ({ ...mapAudit(r), org_name: r.org_name, requester: r.requester }));
}
export async function decideAudit(auditId: number, approve: boolean): Promise<void> {
  await ensureAudits();
  const orgId = await getAuditOrgId(auditId);
  await query(`UPDATE org_audits SET statut=$2, decided_at=now() WHERE id=$1`, [auditId, approve ? "valide" : "refuse"]);
  if (approve && orgId) await setLabellisee(orgId, true);
}
