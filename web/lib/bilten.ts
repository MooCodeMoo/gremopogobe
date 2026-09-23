import { getNapoved, kratekDan, datumKratko, type Napoved } from "./napoved";
import { VRSTE, OZNAKE, barva, besediloNa, stopnja } from "./vrste";
import { URL_STRANI } from "./seo";

const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]!);

/** Sestavi HTML biltena za izbrana območja (prazno = vsa). */
export function biltenHtml(napoved: Napoved, obmocja: string[], odjavaUrl: string) {
  const izbrane = napoved.tocke.filter((t) => obmocja.length === 0 || obmocja.includes(t.slug));
  const vrstice = VRSTE.map((v) => {
    const naj = [...izbrane]
      .map((t) => { const vals = t.indeks[v.id]; const m = Math.max(...vals); return { t, m, dan: vals.indexOf(m) }; })
      .sort((a, b) => b.m - a.m)
      .slice(0, 3);
    if (!naj.length || naj[0].m === 0) return "";
    const postavke = naj.map(({ t, m, dan }) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #DDD6C6;">
          <a href="${URL_STRANI}/regija/${t.slug}" style="color:#1D2118;text-decoration:none;font-weight:600;">${esc(t.ime)}</a>
          <span style="color:#5A5E51;font-size:13px;"> &middot; vrh ${kratekDan(napoved.dnevi[dan]).toLowerCase()} ${datumKratko(napoved.dnevi[dan])}</span>
        </td>
        <td align="right" style="padding:8px 0;border-bottom:1px solid #DDD6C6;">
          <span style="display:inline-block;min-width:40px;padding:5px 8px;border-radius:8px;background:${barva(m)};color:${besediloNa(m)};font-weight:700;text-align:center;">${m}</span>
        </td>
      </tr>`).join("");
    return `<h3 style="font-size:17px;margin:26px 0 6px;">${v.ime}</h3>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">${postavke}</table>
      <p style="margin:6px 0 0;color:#5A5E51;font-size:13px;">Najvišja ocena: ${OZNAKE[stopnja(naj[0].m)].toLowerCase()}.</p>`;
  }).join("");

  const obdobje = `${datumKratko(napoved.dnevi[0])} - ${datumKratko(napoved.dnevi[napoved.dnevi.length - 1])}`;
  const najboljsa = VRSTE.map((v) => {
    const naj = izbrane.map((t) => Math.max(...t.indeks[v.id])).sort((a, b) => b - a)[0] ?? 0;
    return { ime: v.ime, naj };
  }).sort((a, b) => b.naj - a.naj)[0];
  const predogled = najboljsa && najboljsa.naj > 0
    ? `Najboljše razmere ta teden ima ${najboljsa.ime.toLowerCase()} (${najboljsa.naj}/100).`
    : "Ta teden razmere niso obetavne.";
  return `<!doctype html><html lang="sl"><body style="margin:0;background:#F3EFE6;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1D2118;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(predogled)}</div>
  <div style="max-width:560px;margin:0 auto;padding:28px 20px;">
    <a href="${URL_STRANI}" style="display:inline-block;margin-bottom:18px;"><img src="${URL_STRANI}/brand/logo.png" alt="gremo po gobe" width="150" style="display:block;border:0;"></a>
    <p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#8A3A1C;font-weight:700;">Gobarska napoved ${obdobje}</p>
    <h1 style="font-size:26px;margin:0 0 4px;">Kje bo ta vikend polna košara?</h1>
    <p style="margin:0 0 8px;color:#5A5E51;font-size:14px;">${obmocja.length ? "Za tvoja izbrana območja." : "Za vsa območja v Sloveniji."}</p>
    ${vrstice || '<p style="color:#5A5E51;">Ta teden ni obetavnih razmer za nobeno od vrst.</p>'}
    <p style="margin:28px 0 0;"><a href="${URL_STRANI}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#0F3320;color:#fff;text-decoration:none;font-weight:600;">Odpri zemljevid</a></p>
    <p style="margin:28px 0 0;color:#5A5E51;font-size:12px;line-height:1.5;">
      Indeks je ocena razmer, ne zagotovilo najdbe in ne pomoč pri določanju užitnosti.<br>
      <a href="${odjavaUrl}" style="color:#5A5E51;">Odjava od biltena</a> &middot; gremopogobe.si
    </p>
  </div></body></html>`;
}

export async function napovedZaBilten() {
  return getNapoved();
}
