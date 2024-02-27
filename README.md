# Reddix

A browser extension that helps you organize and search your saved and upvoted Reddit items.

## Usage

It's a [Vite](https://vitejs.dev/) powered WebExtension ([Chrome](https://developer.chrome.com/docs/extensions/reference/), [FireFox](https://addons.mozilla.org/en-US/developers/), etc.) based on [vitesse-webext](https://github.com/antfu/vitesse-webext) template.

### Development

```bash
pnpm dev
```

Then **load extension in browser with the `extension/` folder**.

For Firefox developers, you can run the following command instead:

```bash
pnpm start:firefox
```

### Build

To build the extension, run

```bash
pnpm build
```

And then pack files under `extension`.
