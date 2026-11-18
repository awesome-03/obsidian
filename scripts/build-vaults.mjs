// Builds every vault listed in vaults.json as its own Quartz site, then adds the vault picker.
//
//   vaults/<id>/  →  public/<id>/     (one Quartz build per vault)
//   site/index.html  →  public/index.html  (the picker, with the vault list filled in)
//
// Run it with: node scripts/build-vaults.mjs

import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import YAML from "yaml"
import { readVaults, renderPicker } from "./picker.mjs"

const root = path.resolve(import.meta.dirname, "..")
const outDir = path.join(root, "public")

const vaults = readVaults(root)
const { configuration } = YAML.parse(fs.readFileSync(path.join(root, "quartz.config.yaml"), "utf8"))
const siteBaseUrl = configuration.baseUrl.replace(/\/+$/, "")

fs.rmSync(outDir, { recursive: true, force: true })

const built = []
for (const vault of vaults) {
  const contentDir = path.join("vaults", vault.id)
  if (!fs.existsSync(path.join(root, contentDir))) {
    console.warn(`Skipping "${vault.id}": ${contentDir}/ doesn't exist yet (publish a note to it first).`)
    continue
  }

  console.log(`\nBuilding vault "${vault.id}" from ${contentDir}/`)
  const result = spawnSync(
    "npx",
    ["quartz", "build", "-d", contentDir, "-o", path.join("public", vault.id)],
    {
      cwd: root,
      stdio: "inherit",
      env: {
        ...process.env,
        QUARTZ_VAULT_TITLE: vault.title,
        QUARTZ_VAULT_BASE_URL: `${siteBaseUrl}/${vault.id}`,
      },
    },
  )
  if (result.status !== 0) {
    console.error(`\nBuilding vault "${vault.id}" failed.`)
    process.exit(result.status ?? 1)
  }
  built.push(vault)
}

if (built.length === 0) {
  console.error("\nNo vaults were built. Check vaults.json and the vaults/ folder.")
  process.exit(1)
}

fs.writeFileSync(path.join(outDir, "index.html"), renderPicker(root, built))

console.log(`\nBuilt ${built.length} vault(s) and the picker into public/`)
