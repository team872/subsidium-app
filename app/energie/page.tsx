import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Le « Champ d'Énergie » a été fusionné dans la Market-place
// (doctrine — Glossaire SUBSIDIUM : « Champ d'Énergie (Market Place) : Lieu des ressources
// et accompagnements »). Les anciens liens /energie sont redirigés vers /marche.
export default function EnergieRedirect() {
  redirect("/marche");
}
