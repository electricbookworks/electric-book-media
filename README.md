# Electric Book media

This is a template repo for storing images separately from an Electric Book project. This is useful when your book contains many images, and would make the main project repo too big.

This content is managed using the [Electric Book workflow](http://electricbookworks.github.io/electric-book/). [See the docs](http://electricbookworks.github.io/electric-book/docs) for how this works.

In particular, see the docs on using external media.

## Setup

1. **Install Node**. Head to [nodejs.org](https://nodejs.org/en/) and download and install the latest version. If you're using MacOS, it's best to use [Homebrew](https://brew.sh/) to do this (by running `brew update` then `brew install node`).
2. **Install Gulp**. From the terminal/command prompt run `npm install gulp-cli -g` to install gulp. This installs gulp on your system.
3. Once that's finished, run `npm install` to install Node modules (listed in `package.json`).
4. **Install Graphicsmagick**. Head to [the download section of graphicsmagick.org](http://www.graphicsmagick.org/download.html#download-sites) and download and install GraphicsMagick for your system. 

    Use the Q16 version for best results with colour conversions.

    If you are on Mac OSX, we recommend installing GraphicsMagick using [Homebrew](https://brew.sh/), and make sure to add the 'little CMS' when you install, like this:

    ```
    brew install graphicsmagick --with-little-cms2
    ```

    Note that if you have already installed GraphicsMagick but without specifying `--with-little-cms2`, you will need to `brew uninstall graphicsmagick` first. Little CMS is required for managing colour profiles during image conversions, but it is not installed by default on OSX.

## Usage

Run `gulp` to generate smaller, optimised, version of the images in the `book/images/_source` directory and automatically put them into the `book/images/print-pdf`, `book/images/screen-pdf`, `book/images/web`, `book/images/epub` and `book/images/app` directories.

To process images in other books, run `gulp --book mybookdirectory` (where `mybookdirectory` is the name of the relevant book directory). Alternatively, `gulp --folder mybookdirectory` does the same thing.

### SVGs

In order to inject SVGs inline in projects from a remote-media repo like this one, we need to allow cross-origin resource sharing (CORS). That is, when these images are served from the remote-media site, that site needs to allow the content repo/site to fetch images over an XMLHttpRequest (XHR). Injecting SVGs inline only works over HTTP, so the images must be web-served and not accessed directly from the file system.

When serving images locally (e.g. at http://127.0.0.1:5000), we can allow CORS on the server we run. The `run-` scripts in this repo turn on CORS for local development. And for serving the files over Netlify, it provides a `netlify.toml` file that should set the headers to allow CORS there. With this in place, you can only serve these images with Netlify (or another host that allows you to set CORS headers), and not GitHub Pages, which will not work since it does not support CORS headers.

CORS is not required on a site where images are served on the same domain as the content.
