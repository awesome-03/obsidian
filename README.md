# obsidian

My Obsidian vaults, published at **https://awesomedev.site/obsidian/**. Built with [Quartz v5](https://quartz.jzhao.xyz/).

- `awesomedev.site/obsidian/` => vault picker (remembers the last opened vault, `?choose` forces the picker)
   - Clicking "← All vaults" in the sidebar goes back to the `?choose` menu
- `awesomedev.site/obsidian/<vault>/` => vault paths

<small>Below are here as a note for myself so that I don't have to remember how to do things.</small>

## Publishing notes

1. In Obsidian, add `publish: true` to the note's properties:
   ```yaml
   ---
   publish: true
   ---
   ```
2. `Ctrl+P` → Quartz Syncer: Open Publication Center → Publish.

- Each vault needs a published `index` note .

## Adding a vault

1. Install **Quartz Syncer** in the new vault
   - In setup wizard: repo `awesome-03/obsidian`, branch `v5`, a GitHub token
   - In syncer settings: `Content folder` = `vaults/<name>` for the url
3. Make an `index` note with `publish: true` and publish it.
4. `git pull` and add the vault to `vaults.json`
5. Commit with `npx quartz sync -m "Add <name> vault"`.

## Editing the site

```bash
# before starting
git pull
# editing done
npx quartz sync -m "commit note"
```

**To start the local server:**
```bash
node scripts/preview.mjs
```

- Opens at http://localhost:8090/obsidian/
- Auto reloads on `site/index.html` or `vaults.json` change
   - Vault pages need a restart.
- `--no-build` to skip rebuilding the vaults.

**Quartz's own live reload for single vaults:**
```bash
npx quartz build --serve -d vaults/minecraft
```

## Quartz Syncer settings

- Remote URL `https://github.com/awesome-03/obsidian.git`, branch `v5`, provider GitHub, bearer token
- Content folder `vaults/minecraft`, vault root folder `/`
- Auto-publish timer **off**
- Token: fine-grained, only this repo, **Contents: Read and write**. Expires after max 1 year → GitHub emails me → make a new one and paste it into the Syncer settings.

## Other

**To set up new PC:**
```bash
git clone git@github.com:awesome-03/obsidian.git
cd obsidian
npm ci
npx quartz plugin install
node scripts/preview.mjs
```

Needs Node 22+.

**To update Quartz:**

```bash
git pull
npx quartz upgrade
```
