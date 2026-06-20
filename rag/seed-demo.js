// Seed d'une demonstration du LOT 2 sur l'idee 10 : echange a plusieurs voix
// avec une image (plan) et un PDF (etude) generes en pur Node, + une notification
// pour le compte test. A executer DANS le conteneur subsidium-app (pg + DATABASE_URL).
const { Client } = require("pg");
const zlib = require("zlib");
const IDEA = 10;

/* ---------- PNG (schema du reseau cyclable) ---------- */
function pngFromPixels(w, h, rgb) {
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
    }
    return (c ^ 0xffffffff) >>> 0;
  }
  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
    const td = Buffer.concat([Buffer.from(type, "latin1"), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td), 0);
    return Buffer.concat([len, td, crc]);
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc(h * (1 + w * 3));
  for (let y = 0; y < h; y++) { raw[y * (1 + w * 3)] = 0; rgb.copy(raw, y * (1 + w * 3) + 1, y * w * 3, (y + 1) * w * 3); }
  const idat = zlib.deflateSync(raw);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}
function buildPng() {
  const W = 640, H = 360, rgb = Buffer.alloc(W * H * 3);
  const fill = (x0, y0, x1, y1, r, g, b) => {
    for (let y = Math.max(0, y0); y < Math.min(H, y1); y++)
      for (let x = Math.max(0, x0); x < Math.min(W, x1); x++) { const i = (y * W + x) * 3; rgb[i] = r; rgb[i + 1] = g; rgb[i + 2] = b; }
  };
  fill(0, 0, W, H, 244, 236, 227);      // fond creme
  fill(0, 0, W, 56, 55, 38, 70);        // bandeau titre (plum)
  // rues (gris)
  fill(40, 300, 600, 314, 201, 191, 180);
  fill(40, 150, 600, 164, 201, 191, 180);
  fill(96, 90, 110, 320, 201, 191, 180);
  fill(300, 90, 314, 320, 201, 191, 180);
  fill(500, 90, 514, 320, 201, 191, 180);
  // pistes cyclables (coral) + voie verte (vert)
  fill(40, 303, 600, 311, 242, 123, 106);
  fill(305, 90, 313, 310, 242, 123, 106);
  fill(101, 90, 109, 310, 242, 123, 106);
  fill(40, 153, 600, 161, 94, 138, 87);
  // legende
  fill(470, 250, 612, 332, 255, 255, 255);
  fill(484, 270, 520, 278, 242, 123, 106);
  fill(484, 300, 520, 308, 94, 138, 87);
  return pngFromPixels(W, H, rgb);
}

/* ---------- PDF (etude de faisabilite) ---------- */
function esc(s) { return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)"); }
function buildPdf(title, lines) {
  let content = "BT /F1 18 Tf 40 800 Td (" + esc(title) + ") Tj ET\n";
  let y = 768;
  for (const ln of lines) { content += "BT /F1 11 Tf 40 " + y + " Td (" + esc(ln) + ") Tj ET\n"; y -= 17; }
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    "<< /Length " + Buffer.byteLength(content, "latin1") + " >>\nstream\n" + content + "endstream",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [];
  for (let i = 0; i < objs.length; i++) {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += (i + 1) + " 0 obj\n" + objs[i] + "\nendobj\n";
  }
  const xrefPos = Buffer.byteLength(pdf, "latin1");
  pdf += "xref\n0 " + (objs.length + 1) + "\n0000000000 65535 f \n";
  for (const off of offsets) pdf += String(off).padStart(10, "0") + " 00000 n \n";
  pdf += "trailer\n<< /Size " + (objs.length + 1) + " /Root 1 0 R >>\nstartxref\n" + xrefPos + "\n%%EOF";
  return Buffer.from(pdf, "latin1");
}

(async () => {
  const png = buildPng();
  const pdf = buildPdf("Etude de faisabilite - Pistes cyclables", [
    "Quartier : Lyon 3e - Reseau cyclable continu et securise",
    "",
    "1. Contexte",
    "   Demande citoyenne pour relier les axes existants et securiser",
    "   les abords des ecoles.",
    "",
    "2. Trace propose",
    "   ~4,2 km de pistes protegees + 1,1 km de voie verte le long du parc.",
    "",
    "3. Points de vigilance",
    "   - Carrefour de l'ecole Jean Jaures (securisation prioritaire)",
    "   - Continuite avec la piste de l'avenue Felix-Faure",
    "",
    "Document de travail - version provisoire pour echange citoyen.",
  ]);

  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  await c.query("DELETE FROM comments WHERE idea_id=$1 AND author IN ('Compte Test','Maria Daniel','Karim B.','Sophie L.')", [IDEA]);
  await c.query("DELETE FROM notifications");
  await c.query("INSERT INTO follows (user_id,idea_id) VALUES (3,$1) ON CONFLICT DO NOTHING", [IDEA]);

  async function add(author, uid, body, mins, file) {
    const r = await c.query(
      "INSERT INTO comments (idea_id,user_id,author,body,created_at) VALUES ($1,$2,$3,$4, now() - ($5||' minutes')::interval) RETURNING id",
      [IDEA, uid, author, body, String(mins)]
    );
    const cid = r.rows[0].id;
    if (file) {
      await c.query(
        "INSERT INTO attachments (comment_id,filename,mime,size,data) VALUES ($1,$2,$3,$4,$5)",
        [cid, file.name, file.mime, file.data.length, file.data]
      );
    }
    return cid;
  }

  await add("Maria Daniel", 1, "Merci pour vos retours ! Voici le trace envisage pour le reseau cyclable continu.", 180, { name: "plan-reseau-cyclable.png", mime: "image/png", data: png });
  await add("Karim B.", 2, "Tres clair. J'ajoute l'etude de faisabilite realisee l'an dernier.", 120, { name: "etude-faisabilite.pdf", mime: "application/pdf", data: pdf });
  await add("Sophie L.", null, "Il faudrait vraiment securiser le carrefour pres de l'ecole Jean Jaures.", 60, null);

  await c.query(
    "INSERT INTO notifications (user_id,type,idea_id,actor,message,created_at) VALUES (3,'comment',$1,'Karim B.','Karim B. a participe a la discussion sur la piste cyclable que vous suivez', now() - interval '110 minutes')",
    [IDEA]
  );

  const cnt = await c.query("SELECT count(*)::int n FROM comments WHERE idea_id=$1", [IDEA]);
  console.log("OK idea", IDEA, "comments", cnt.rows[0].n, "png", png.length, "pdf", pdf.length);
  await c.end();
})().catch((e) => { console.error("SEED_ERR", e.message); process.exit(1); });
