> ⚠️ **WORK IN PROGRESS**: This package requires changes[^filename-change] in Astro before it will be useable. Sit tight!

# astro-opengraph-image

This is an [Astro middleware](https://docs.astro.build/guides/middleware/) that allows you to easily render Astro components to images.

# Prerequisites

- This middleware is for [Astro](https://astro.build).
- Node.js: The [@resvg/resvg-wasm](https://www.npmjs.com/package/@resvg/resvg-wasm) module must be initialized in a runtime-specific manner. I have only added support for Node.js. Other runtimes such as [Deno](https://deno.land/) or [Bun](https://bun.sh/) can be trivially added with an adapter. Please feel free to submit a pull request.

# Installation

In your existing Astro project:

```sh
# Using NPM
npm install @altano/astro-opengraph-image
# Using Yarn
yarn add @altano/astro-opengraph-image
# Using PNPM
pnpm add @altano/astro-opengraph-image
```

# Setup

Create a `middleware.ts` file[^middleware-docs] if you haven't already. `middleware.ts`:

```ts
import { createOpenGraphImageMiddleware } from "@altano/astro-opengraph-image";

export const onRequest = createOpenGraphImageMiddleware({ ... });
```

Create a component to convert to an image. It must have a `.png.astro` extension, e.g. `image.png.astro`:

```astro
<html><body>Hello!</body></html>
```

NOTE: Your Astro component must be HTML elements and styles [supported by Satori](https://github.com/vercel/satori#jsx), e.g. it can't be stateful or use `calc()` in css. The [OG Image Playground](https://og-playground.vercel.app/) is a great place to test your component before copying it into your Astro project.

Lastly, in any pages/layouts that have a `opengraph-image.png.astro` in that route, you need to add the `<OpenGraphMeta />` component to generate opengraph meta tags in your head, e.g.:

```astro
---
import OpenGraphMeta from "@altano/astro-opengraph-image/components/meta.astro";
---

<html>
  <head>
    <OpenGraphMeta />
  </head>
  <body>
    <p>My opengraph-image should be the root one!</p>
  </body>
</html>
```

# Simple Example

`src/middleware.ts`:

```ts
import { createOpenGraphImageMiddleware } from "@altano/astro-opengraph-image";

export const onRequest = createOpenGraphImageMiddleware({
  runtime: "nodejs",
  async getSvgOptions() {
    const interRegularBuffer = await fetch(`https://rsms.me/inter/font-files/Inter-Regular.woff`).then((res) => res.arrayBuffer());
    return {
      fonts: [
        {
          name: "Inter Variable",
          data: interRegularBuffer,
          weight: 400,
          style: "normal",
        },
      ],
    };
  },
});
```

`src/pages/opengraph-image.png.astro`:

```astro
---
/**
 * This is not used during image generation. It is only here
 * to make the fonts consistent between the generated image
 * and how the component is rendered if the image generation
 * middleware is disabled.
 */
import "@fontsource-variable/inter";
---

<html>
  <body
    style=`font-family: "Inter Variable";
           background: white;
           height: 100vh;
           width: 100vw;
           display: flex;
           flex-direction: column;
           align-items: center;
           justify-content: center;`
  >
    <h1
      style="font-weight: 800;
             font-size: 5rem;
             margin: 0;"
    >
      My Website!
    </h1>
    <p style="font-weight: 400;
              font-size: 2rem;">
      This is rendered as a PNG image.
    </p>
  </body>
</html>
```

`src/pages/index.astro`

```astro
<html>
  <head>
    <title>Homepage</title>
    <OpenGraphMeta title="My Website" description="This is a website." />
  </head>
  <body>
    ...
  </body>
</html>
```

See https://github.com/altano/npm-packages/tree/main/examples/astro-opengraph-image for a slightly more involved example.

# Options Reference

`createOpenGraphImageMiddleware` requires the following options:

- `runtime`: currently only "nodejs".
- `format`: Any output format that the [@resvg/resvg-wasm](https://www.npmjs.com/package/@resvg/resvg-wasm) library accepts, which is currently only "png".
- `getSvgOptions`: [Options that the vercel/satori](https://github.com/vercel/satori/blob/main/src/satori.ts#L18) library accepts. You must at least specify dimensions and one font.

See the TypeScript type-hints and comments for more info.

# Recipes

## Using Custom Fonts

`middleware.ts`:

```ts
import { createOpenGraphImageMiddleware } from "@altano/astro-opengraph-image";

export const onRequest = createOpenGraphImageMiddleware({
  async getSvgOptions() {
    const interRegularBuffer = await fetch(`https://rsms.me/inter/font-files/Inter-Regular.woff`).then((res) => res.arrayBuffer());
    const interBoldBuffer = await fetch(`https://rsms.me/inter/font-files/Inter-Bold.woff`).then((res) => res.arrayBuffer());
    return {
      fonts: [
        {
          name: "Inter Variable",
          data: interRegularBuffer,
          weight: 400,
          style: "normal",
        },
        {
          name: "Inter Variable",
          data: interBoldBuffer,
          weight: 800,
          style: "normal",
        },
      ],
    };
  },
});
```

## Serving another opengraph-image

If your `opengraph-image.png.astro` is somewhere else, you can specify a directory relative to the current request URL, e.g. to point at an `opengraph-image.png.astro` file you've put at the root of your site:

```astro
<html>
  <head>
    <title>My opengraph image is at the site root</title>
    <OpenGraphMeta directory="/" />
  </head>
</html>
```

## Adding title/description

Lastly, for convenience, you can optionally pass in `title` and/or `description` to get the `og:title` and `og:description` meta tags:

```astro
<OpenGraphMeta title="Nope" description="I'm not important" />
```

## Dynamic Routes

If you have a dynamic route such as `./src/pages/[...slug].astro`, convert it to `./src/pages/[...slug]/index.astro`

Along-side your dynamic route (e.g. `./src/pages/[...slug]/index.astro`) add `./src/pages/[...slug]/opengraph-image.png.astro`:

```
src/
├─ pages/
│  ├─ [...slug]/
│  │  ├─ index.astro
│  │  ├─ opengraph-image.png.astro
```

Within `opengraph-image.png.astro` you can either duplicate your implementation of `getStaticPaths` or you can re-export the same one used in `index.astro`:

```astro
---
import { getStaticPaths as gsp } from "./index.astro";
export const getStaticPaths = gsp;
---
```

# How it Works

This library is a tiny wrapper around [@altano/astro-html-to-image](https://github.com/altano/npm-packages/tree/main/packages/astro-html-to-image) which can convert any html response in Astro into an image.

[^filename-change]: https://github.com/withastro/roadmap/discussions/643
[^middleware-docs]: https://docs.astro.build/guides/middleware
