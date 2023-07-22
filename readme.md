# Logseq Plugin: *Show Weekday and Week-number* 📆

- Plugin for showing weekday and week number beside journal titles.

[![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-show-weekday-and-week-number)](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/releases)
[![License](https://img.shields.io/github/license/YU000jp/logseq-plugin-show-weekday-and-week-number?color=blue)](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/LICENSE)
[![Downloads](https://img.shields.io/github/downloads/YU000jp/logseq-plugin-show-weekday-and-week-number/total.svg)](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/releases)
 Published 2023/05/26

---

## Features

### Behind Journal Title

- Like below

1. ![image](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/f47b8948-5e7a-4e16-a5ae-6966672742b1)
1. ![image](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/ee97c455-714e-45d2-9f9f-905798e298b4)

### Journal boundaries

![boundaries](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/685d00e7-b67d-4ee3-9f8a-25657447a2ea)

### Localize journal link 🆕

- If the day of the week is not included in user date format, add the localized day of the week to the journal link
- If it is included in the format, localize the day of the week in the journal link
- 2023/07/22 => 2023/07/22 (Saturday)
  > (Saturday) is the localized day of the week. 

### Weekly Journal

- If there is no content available on a page with a week number like `2023-W25`, a template will be inserted.

---

## Getting Started

### Install from Logseq Marketplace

- Press [`---`] on the top right toolbar to open [`Plugins`]
- Select `Marketplace`
- Type `Show` in the search field, select it from the search results and install

   ![image](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/5c3a2b34-298b-4790-8e12-01d83e289794)

### Usage

- When this plugin install, the style be applied to journals or the single journal page , the right sidebar.

### Plugin Settings

- Week number format: select
  > Week numbers differ between like `US format`(America) and `ISO format`(Europe) when transitioning across years.
  - `US format`
  - `ISO(EU) format` default
  - `Japanese format`
- **Journal Title**, Alignment of journal page title: select
  - `left`
  - `space-around` default
- **Day of the week**, Select language Localize(:default) or English(:en): select
  - `default` default
  - `en`
- **Behind journal title**, Enable the day of week: toggle
  - `true` default
  - `false`
- **Behind journal title** / **Localize journal link**, Day of the week long or short: select
  - `long` default
  - `short`
- **Behind journal title**, Enable week number: toggle
  - `true` default
  - `false`
- **Behind journal title**, Show week number of the year or month (unit): select
  - `Year` default
  - `Month`
- **Behind journal title**, Coloring to the word of Saturday or Sunday: toggle
  - `true` default
  - `false`
- **Behind journal title** / **Localize journal link**, Enable relative time: toggle
  - `true` default
  - `false`
- **Journal boundaries**, Enable feature: toggle
  > Show the boundaries of days before and after the day on the single journal page
  - `true` default
  - `false`
- **Journal boundaries**, Use also on journals: toggle
  - `true` default
  - `false`
- **Journal boundaries**, Enable 2 week mode (only journals): toggle [#58](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/issues/58)
  - `true` default
  - `false`
- **Journal boundaries**, Custom day range: before today (Excludes 2 week mode): select [#58](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/issues/58) [#60](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/issues/60)
  - `11`
  - `10`
  - `9`
  - `8`
  - `7`
  - `6` default
  - `5`
  - `4`
  - `3`
- **Journal boundaries**, Custom day range: after today (Excludes 2 week mode): select [#58](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/issues/58)
  - `1`
  - `2`
  - `3`
  - `4` default
  - `5`
  - `6`
- On **Journal boundaries** if no page found, create the journal page: toggle
  - `true`
  - `false` default
- **Weekly Journal**, Enable feature: toggle [#65](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/issues/65)
  > Enable the link and function. If there is no content available on a page with a week number like `2023-W25`, a template will be inserted.
  - `true` default
  - `false`
- **Weekly Journal**, Template name: input
  - default: blank
- **Weekly Journal**, Set page tag (Add to tags property): input
  - default: blank
- **Weekly Journal**, Enable "This Week" section: toggle [#55](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/issues/55)
  - `true` default
  - `false`
- **Weekly Journal**, Convert the day of the week in the "This Week" section into links.: toggle
  - `true`
  - `false` default
- **Localize journal link**: If the day of the week is included in user date format, localize the day of the week in the date link: toggle [#68](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/issues/68)
  - `true` default
  - `false`
- **Localize journal link**: If the day of the week is not included in user date format, add the localized day of the week to the date link: toggle [#68](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/issues/68)
  - `true` default
  - `false`
- **Journal Title**, If user date format is yyyy/mm/dd, Enable hierarchy link (split to 3 journal link): toggle [#77](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/issues/77)
  - `true` default
  - `false`
 
---

## Contributions

- [Show week day and week number - discuss.logseq.com](https://discuss.logseq.com/t/show-week-day-and-week-number/12685/18)
  - [danilofaria](https://discuss.logseq.com/u/danilofaria/)
  - [ottodevs](https://discuss.logseq.com/u/ottodevs/)

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
