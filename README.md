<h1 align="center">Goldberg Snarks</h1>

<p align="center">
	A website about Goldberg snarks, a family of graphs.
	🕸️
</p>

<p align="center">
	<!-- prettier-ignore-start -->
	<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
	<a href="#contributors" target="_blank"><img alt="👪 All Contributors: 1" src="https://img.shields.io/badge/%F0%9F%91%AA_all_contributors-1-21bb42.svg" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
	<!-- prettier-ignore-end -->
	<a href="https://github.com/JoshuaKGoldberg/goldberg-snarks/blob/main/.github/CODE_OF_CONDUCT.md" target="_blank"><img alt="🤝 Code of Conduct: Kept" src="https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42" /></a>
	<a href="https://github.com/JoshuaKGoldberg/goldberg-snarks/blob/main/LICENSE.md" target="_blank"><img alt="📝 License: MIT" src="https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg" /></a>
	<img alt="💪 TypeScript: Strict" src="https://img.shields.io/badge/%F0%9F%92%AA_typescript-strict-21bb42.svg" />
</p>

## About

This is the source of [goldbergsnarks.com](https://goldbergsnarks.com).

A _graph_ is a set of points joined by lines.
Most graphs in which three lines meet at every point can have their lines given three colors, so that lines that meet have different colors.
A _snark_ is a graph like that whose lines need four colors, with some exceptions.
The _Goldberg snarks_ are a family of snarks that Mark Goldberg published in 1981.
The six smallest are:

<p align="center">
	<a href="https://goldbergsnarks.com/g5"><img alt="Drawing of the Goldberg snark G5" src=".github/images/g5.svg" width="30%" /></a>
	<a href="https://goldbergsnarks.com/g7"><img alt="Drawing of the Goldberg snark G7" src=".github/images/g7.svg" width="30%" /></a>
	<a href="https://goldbergsnarks.com/g9"><img alt="Drawing of the Goldberg snark G9" src=".github/images/g9.svg" width="30%" /></a>
	<br />
	<a href="https://goldbergsnarks.com/g11"><img alt="Drawing of the Goldberg snark G11" src=".github/images/g11.svg" width="30%" /></a>
	<a href="https://goldbergsnarks.com/g13"><img alt="Drawing of the Goldberg snark G13" src=".github/images/g13.svg" width="30%" /></a>
	<a href="https://goldbergsnarks.com/g15"><img alt="Drawing of the Goldberg snark G15" src=".github/images/g15.svg" width="30%" /></a>
</p>

The [homepage](https://goldbergsnarks.com) explains Goldberg snarks in general.
There are also pages for these six, from [G5](https://goldbergsnarks.com/g5) to [G15](https://goldbergsnarks.com/g15), and for [G3](https://goldbergsnarks.com/g3), a related graph that is not a snark.

The site is built with [Astro](https://astro.build).
Its drawings, and most of its numbers, are computed by the code in [`src/graphs`](./src/graphs).

## Development

See [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md), then [`.github/DEVELOPMENT.md`](./.github/DEVELOPMENT.md).
Thanks! 🕸️

## Contributors

<!-- spellchecker: disable -->
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://www.joshuakgoldberg.com/"><img src="https://avatars.githubusercontent.com/u/3335181?v=4&size=100" width="100px" height="100px" alt="Josh Goldberg"/><br /><sub><b>Josh Goldberg</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/goldberg-snarks/commits?author=JoshuaKGoldberg" title="Code">💻</a> <a href="#content-JoshuaKGoldberg" title="Content">🖋</a> <a href="https://github.com/JoshuaKGoldberg/goldberg-snarks/commits?author=JoshuaKGoldberg" title="Documentation">📖</a> <a href="#ideas-JoshuaKGoldberg" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-JoshuaKGoldberg" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-JoshuaKGoldberg" title="Maintenance">🚧</a> <a href="#projectManagement-JoshuaKGoldberg" title="Project Management">📆</a> <a href="#tool-JoshuaKGoldberg" title="Tools">🔧</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- spellchecker: enable -->

> 💝 This repository was templated with [`create-typescript-app`](https://github.com/JoshuaKGoldberg/create-typescript-app) using the [Bingo framework](https://create.bingo).
