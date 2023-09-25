# Logseq Plugin: *Show Weekday and Week-number* 📆

- Show weekday and week number beside journal titles.

[![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-show-weekday-and-week-number)](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/releases)
[![License](https://img.shields.io/github/license/YU000jp/logseq-plugin-show-weekday-and-week-number?color=blue)](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/LICENSE)
[![Downloads](https://img.shields.io/github/downloads/YU000jp/logseq-plugin-show-weekday-and-week-number/total.svg)](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/releases)
 Published 2023/05/26

---

## Options

### Behind Journal Title

- Using the plugin, the week number for that week will be generated.
- Like below

1. ![image](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/f47b8948-5e7a-4e16-a5ae-6966672742b1)
1. ![image](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/ee97c455-714e-45d2-9f9f-905798e298b4)

### Journal boundaries (mini-calendar)

- Always display a simple calendar on journals.
- Smooth access to previous and subsequent dates on a single date page or journals.

![image](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/126b7d4a-502a-4408-999b-82555bddf6f1)

### Weekly Journal

- Click the week number link to open it (When opening, generate a page)
  > If the page was not generated successfully, remove the page from the page title.
- If there is no content available on a page with a week number like `2023-W25`, a template will be inserted.
- In plugin settings, it possible to set user template. Inserting Advanced queries into the template increases flexibility.

#### "This Week" section (collection of those date links)

- It becomes references for the day by nesting it in date links.

### [Slash Command for link or input](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/wiki/Document#slash-command) 🆕

- To create a link to the weekly journal page
  - `/Current week number link: [[yyyy/Ww]]` [#79](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/issues/79) 🆙

### ~~Localize day of the week in journal links~~

- Split to [Flex date format plugin](https://github.com/YU000jp/logseq-plugin-flex-date-format) 🆙
- ~~If the day of the week is not included in user date format, add the localized day of the week to the journal link~~
- ~~If it is included in the format, localize the day of the week in the journal link~~
- ~~2023/07/22 => 2023/07/22 (Sat)~~
  > ~~`(Sat)` is the localized day of the week.~~

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
- ~~**Journal title**, Alignment of journal page title: select~~ delete🆙
  - ~~`left` default~~
  - ~~`space-around`~~
- **Day of the week**, Select language Localize(:default) or English(:en): select
  - `default` default
  - `en`

#### Behind journal title

- Enable the day of week: toggle
  - `true` default
  - `false`
- Day of the week long or short: select
  - `long` default
  - `short`
- Enable week number: toggle
  - `true` default
  - `false`
- Hide the year of week number: toggle [#84](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/issues/84) 🆕
  - `true`
  - `false` default
  > Enabling this setting conceals the year representation in the date format. For instance, 2023-W30 displays as W30. Typically, the notation of week numbers follows the rules based on ISO 8601. The reason for distinguishing the year is that the first week of a year might be included in the last week of the previous year. Only in such cases does it display as 2023-W53.
- Show week number of the year or month (unit): select
  - `Year` default
  - `Month`
- Coloring to the word of Saturday or Sunday: toggle
  - `true` default
  - `false`

#### Behind journal title ~~/ Localize journal link~~

- Enable relative time: toggle
  - `true` default
  - `false`
 
#### Journal boundaries

- Enable feature: toggle
  > Show the boundaries of days before and after the day on the single journal page
  - `true` default
  - `false`
- Use also on journals: toggle
  - `true` default
  - `false`
- Enable 2 week mode (only journals): toggle [#58](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/issues/58)
  - `true` default
  - `false`
- Custom day range: before today (Excludes 2 week mode): select [#58](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/issues/58) [#60](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/issues/60)
  - `11`,`10`,`9`,`8`,`7`,`6` default ,`5`,`4`,`3`
- Custom day range: after today (Excludes 2 week mode): select [#58](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/issues/58)
  - `1`,`2`,`3`,`4` default ,`5`,`6`
- If no page found, create the journal page: toggle
  - `true`
  - `false` default

 #### Weekly Journal
 
- Enable feature: toggle [#65](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/issues/65)
  > Enable the link and function. If there is no content available on a page with a week number like `2023-W25`, a template will be inserted.
  - `true` default
  - `false`
- Template name: input
  - default: blank
- Set page tag (Add to tags property): input
  - default: blank
- Enable "This Week" section: toggle [#55](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/issues/55)
  - `true` default
  - `false`
- Convert the day of the week in the "This Week" section into links.: toggle
  - `true`
  - `false` default
- Weekly Journal, `This Week` section position 🆕 [#96](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/issues/96)
  - `top` default
  - `bottom`
- Weekly Journal, Page-tags type 🆕 [#93](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/issues/93)
- `yyyy, yyyy/MM, yyyy-Ww, yyyy-Ww` default
- `yyyy, yyyy-Ww, yyyy-Ww`
- `yyyy-Ww, yyyy-Ww`
- `unset`

#### Localize journal title 🆙

- If the day of the week is included in user date format, localize the day of the week in the date link: toggle [#68](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/issues/68)
  - `true` default
  - `false`

#### ~~Localize journal link~~

> delete🆙 (split to [Flex date format plugin](https://github.com/YU000jp/logseq-plugin-flex-date-format))

- ~~If the day of the week is included in user date format, localize the day of the week in the date link: toggle [#68](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/issues/68)~~
  - ~~`true` default~~
  - ~~`false`~~
- ~~If the day of the week is not included in user date format, add the localized day of the week to the date link: toggle [#68](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/issues/68)~~
  - ~~`true` default~~
  - ~~`false`~~
 
#### ~~Journal title~~

- ~~If user date format is yyyy/mm/dd, Enable hierarchy link (split to 3 journal link) on single journal page: toggle [#77](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/issues/77)~~
  - ~~`true` default~~
  - ~~`false`~~
  > delete🆙 (split to [Page-tags and Hierarchy plugin](https://github.com/YU000jp/logseq-page-tags-and-hierarchy#show-hierarchy-links-to-page-title-22-))

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
