# Logseq Plugin: *Show Weekday and Week-number* 📆

1. Show weekday and week number beside journal titles.
1. Show the mini-calendar that has navigational links on Daily Journal. Provides access to previous and subsequent single journals, and links to weekly Journal and monthly Journal.

[![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-show-weekday-and-week-number)](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/releases)
[![License](https://img.shields.io/github/license/YU000jp/logseq-plugin-show-weekday-and-week-number?color=blue)](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/LICENSE)
[![Downloads](https://img.shields.io/github/downloads/YU000jp/logseq-plugin-show-weekday-and-week-number/total.svg)](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/releases)
 Published 2023/05/26

---

## Options

### Behind Journal Title ➡️

- The week number for that week will be generated. Like below

1. ![image](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/f47b8948-5e7a-4e16-a5ae-6966672742b1)
1. ![image](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/ee97c455-714e-45d2-9f9f-905798e298b4)

### Journal boundaries (mini-calendar 🗓️)

- Display a 2 lines calendar on journals. Smooth access to previous and subsequent dates on a single date page or journals.

![miniCalendar](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/3ffc5771-089f-43f5-83a5-01a01117670b)

### Weekly Journal 🌛

- Click the week number link to open it and generate a page. If there is no content available on a page with a week number like `[[2023-W25]]`, a template will be inserted. In plugin settings, it possible to set user template.
  > Inserting Advanced queries into the template increases flexibility.

#### "This Week" section (collection of those date links)

- It becomes references for the day by nesting it in date links.

### Monthly Journal

- Click the link on the left side of the mini calendar will open a page like `[[2023/10]]`.
> Currently, there is no page generation feature like Weekly Journal.

### Slash Command 🆕

> Week-number etc.. [Document here](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/wiki/Slash-Command)

### Localize day of the week in journal links

> For languages other than English. Split to [Flex date format plugin](https://github.com/YU000jp/logseq-plugin-flex-date-format) 🆙

---

## Getting Started

### Install from Logseq Marketplace

- Press [`---`] on the top right toolbar to open [`Plugins`]. Select `Marketplace`. Type `Show` in the search field, select it from the search results and install.

   ![image](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/5c3a2b34-298b-4790-8e12-01d83e289794)

### Usage

- When this plugin install, the style be applied to journals or the single journal page , the right sidebar. First, please configure the plugin settings.
   1. Select either US format or ISO format.
      > [Document here](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/wiki/Week-number-format)

### Plugin settings

> [Document here](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/wiki/Plugin-Settings)

---

## Contributions

- [Show week day and week number - discuss.logseq.com](https://discuss.logseq.com/t/show-week-day-and-week-number/12685/18)
  - [danilofaria](https://discuss.logseq.com/u/danilofaria/)
  - [ottodevs](https://discuss.logseq.com/u/ottodevs/)

## Relation

- [Flex date format plugin](https://github.com/YU000jp/logseq-plugin-flex-date-format)

## Showcase / Questions / Ideas / Help

> Go to the [discussion](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/discussions) tab to ask and find this kind of things.

## Author

- GitHub: [YU000jp](https://github.com/YU000jp)

## Prior art & Credit

### Library

- [@logseq/libs](https://logseq.github.io/plugins/)
- [logseq-L10N](https://github.com/sethyuan/logseq-l10n)
- [date-fns](https://date-fns.org/)

### Icon

- [IonutNeagu - svgrepo.com](https://www.svgrepo.com/svg/490868/monday)

---

<a href="https://www.buymeacoffee.com/yu000japan" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="🍌Buy Me A Coffee" style="height: 42px;width: 152px" ></a>
