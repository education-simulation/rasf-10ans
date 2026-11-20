/* Coffre à photos RASF 10 ans
   Les photos privées sont chiffrées (AES-GCM, clé dérivée du code par PBKDF2) dans photos/*.js.
   Sans le bon code, elles restent illisibles, même pour qui télécharge les fichiers.
   Le code saisi sur la page d'accueil est gardé dans le navigateur (localStorage). */
(function () {
  const CLE_STOCK = "rasf.code";
  const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  async function dechiffre(code, donnees) {
    const o = b64(donnees), sel = o.slice(0, 16), iv = o.slice(16, 28), ct = o.slice(28);
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(code), "PBKDF2", false, ["deriveKey"]);
    const cle = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: sel, iterations: (window.RASF_COFFRE && RASF_COFFRE.iter) || 200000, hash: "SHA-256" },
      base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, cle, ct));
  }
  function charge(src) {
    return new Promise((ok, ko) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); });
  }
  const dossierScripts = (() => { const s = document.currentScript; return s ? s.src.replace(/coffre\.js.*$/, "") : ""; })();
  const lire = () => { try { return localStorage.getItem(CLE_STOCK) || ""; } catch (e) { return ""; } };
  window.Coffre = {
    code: lire,
    /* Vérifie un code ; s'il est bon, le mémorise. Renvoie true / false. */
    async essayer(code) {
      if (!code || !window.crypto || !crypto.subtle) return false;
      try {
        if (!window.RASF_COFFRE) await charge(dossierScripts + "photos/verif.js");
        const t = new TextDecoder().decode(await dechiffre(code, RASF_COFFRE.verif));
        if (t !== "RASF-OK") return false;
        try { localStorage.setItem(CLE_STOCK, code); } catch (e) {}
        return true;
      } catch (e) { return false; }
    },
    oublier() { try { localStorage.removeItem(CLE_STOCK); } catch (e) {} },
    /* Déchiffre un dossier de photos ; renvoie {nomFichier: urlBlob}, ou {} sans code valable. */
    async dossier(nom) {
      const code = lire(); if (!code || !window.crypto || !crypto.subtle) return {};
      try {
        if (!window.RASF_PHOTOS || !RASF_PHOTOS[nom]) await charge(dossierScripts + "photos/" + nom + ".js");
        if (!window.RASF_COFFRE) await charge(dossierScripts + "photos/verif.js");
        const out = {};
        for (const [f, v] of Object.entries(RASF_PHOTOS[nom])) out[f] = URL.createObjectURL(new Blob([await dechiffre(code, v.data)], { type: v.mime }));
        return out;
      } catch (e) { return {}; }
    }
  };
})();
