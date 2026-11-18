import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import VaultsLink from "./components/VaultsLink"

// Set by scripts/build-vaults.mjs so each vault gets its own title and URL.
// When unset (e.g. a plain `npx quartz build`), quartz.config.yaml is used as-is.
const vaultTitle = process.env.QUARTZ_VAULT_TITLE
const vaultBaseUrl = process.env.QUARTZ_VAULT_BASE_URL

const config = await loadQuartzConfig({
  ...(vaultTitle ? { pageTitle: vaultTitle } : {}),
  ...(vaultBaseUrl ? { baseUrl: vaultBaseUrl } : {}),
})
export default config

// Put the "All vaults" link at the top of the left sidebar, above the vault title.
const baseLayout = await loadQuartzLayout()
export const layout = await loadQuartzLayout({
  defaults: { left: [VaultsLink(), ...(baseLayout.defaults.left ?? [])] },
})
