# tsc-es6-imports

Command line tool for transpiling TypeScript ES6 imports into JavaScript

## Installation

You can install this package with the command below, or you can use it with npx.

```
npm i -g tsc-es6-imports@beta
```

## Usage

This tool is meant to be used in conjunction with the `npx tsc` command, or whatever process you're using to transpile your TypeScript. Just add `npx tsc-es6-imports` as a seperate command to the end of your build process.

For example, if your current build command is `npx tsc` and you want to use this package as well then you're new command will look like this:

```
npx tsc && npx tsc-es6-imports
```
