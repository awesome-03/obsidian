import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../quartz/components/types"

// "← All vaults" link above the vault title. Each vault lives at <site>/<vault id>,
// so the picker is one level up from the vault's baseUrl.
const VaultsLink: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
  const vaultPath = (cfg.baseUrl ?? "").split("/").slice(1)
  const pickerPath = "/" + vaultPath.slice(0, -1).map((part) => part + "/").join("")
  // data-router-ignore: load the picker as a normal page instead of through Quartz's in-page navigation.
  return (
    <a class="vaults-link" href={`${pickerPath}?choose`} data-router-ignore>
      ← All vaults
    </a>
  )
}

VaultsLink.css = `
.vaults-link {
  display: inline-block;
  margin-bottom: -0.5rem;
  color: var(--gray);
  font-size: 0.85rem;
  font-weight: 400;
  text-decoration: none;
}
.vaults-link:hover {
  color: var(--secondary);
}
`

export default (() => VaultsLink) satisfies QuartzComponentConstructor
