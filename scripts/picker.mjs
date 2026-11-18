// Fills site/index.html with the vault list. Used by build-vaults.mjs and preview.mjs.

import fs from "node:fs"
import path from "node:path"

const escapeHtml = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  )

export function readVaults(root) {
  return JSON.parse(fs.readFileSync(path.join(root, "vaults.json"), "utf8")).vaults
}

export function renderPicker(root, vaults) {
  const links = vaults
    .map((vault) => {
      const id = escapeHtml(vault.id)
      const description = vault.description
        ? `<span class="description">${escapeHtml(vault.description)}</span>`
        : ""
      return `<li><a href="./${id}/" onclick="try{localStorage.setItem('lastVault','${id}')}catch(e){}"><span class="text"><span class="name">${escapeHtml(vault.title)}</span>${description}</span><span class="arrow" aria-hidden="true">→</span></a></li>`
    })
    .join("\n        ")

  return fs
    .readFileSync(path.join(root, "site", "index.html"), "utf8")
    .replace("/* VAULT_IDS */ []", JSON.stringify(vaults.map((vault) => vault.id)))
    .replace("<!-- VAULT_LINKS -->", links)
}
