# Electric Book media

This is a template repo for storing images separately from an Electric Book project. This is useful when your book contains many images, and would make the main project repo too big.

This content is managed using the [Electric Book](http://electricbook.works) workflow. See the [EBW docs](http://electricbook.works) for how this works.

In particular, see the docs on using external media.

## Usage

### Image resizing, JavaScript linting and minifying

We use the task runner [Gulp](https://gulpjs.com/) for these tasks. You can run `gulp` to generate smaller, optimised, version of the images in the `book/images/print-pdf` directory and automatically put them into the `book/images/web`, `book/images/screen-pdf`, and `book/images/epub` directories.

First, we need to install Gulp, NodeJS (which Gulp requires), and [GraphicsMagick](http://www.graphicsmagick.org/) (which we need behind the scenes for the image resizing).

#### Install Node

Head to [nodejs.org](https://nodejs.org/en/) and download and install the latest version. If you're using MacOS, it's best to use [Homebrew](https://brew.sh/) to do this (by running `brew update` then `brew install node`).

#### Install Gulp and our dependencies

From the terminal / command line run `npm install gulp-cli -g` to install gulp. This installs gulp on your system.

Once that's finished run `npm install` to install the dependencies we need, listed in `package.json`.

#### Install GraphicsMagick

Head to [the downadload secrion of graphicsmagick.org](http://www.graphicsmagick.org/download.html#download-sites) and download and install GraphicsMagick for your system. Use the Q16 version for best results with colour conversions.
