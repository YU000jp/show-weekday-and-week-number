# Logseq Plugin: *Show weekday and week-number* 📆

1. Show weekday and week number beside journal titles.
1. Show the 2 lines calendar that has navigational links on Daily Journal.
1. "Weekly Journal" feature

<div align="right">

[English](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/)/[日本語](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/blob/main/readme.ja.md) [![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-show-weekday-and-week-number)](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/releases)[![License](https://img.shields.io/github/license/YU000jp/logseq-plugin-show-weekday-and-week-number?color=blue)](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/LICENSE)
[![Downloads](https://img.shields.io/github/downloads/YU000jp/logseq-plugin-show-weekday-and-week-number/total.svg)](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/releases) Published 20230526 <a href="https://www.buymeacoffee.com/yu000japan"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a pizza&emoji=🍕&slug=yu000japan&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff" /></a>
</div>

## Feature options

### Behind Journal Title ➡️

- The week number for that week will be generated. Like below
  1. ![image](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/f47b8948-5e7a-4e16-a5ae-6966672742b1)
  1. ![image](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/ee97c455-714e-45d2-9f9f-905798e298b4)

### Journal Boundaries Calendar 🗓️

- Display a 2 lines calendar on journals. Smooth access to previous and subsequent dates on a single date page or journals.
  1. Show indicator (dot) of journal entries 🆙
  1. Highlight holidays for the country
     > Show Lunar-calendar date for Chinese

![README用](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/114708ab-0389-4c46-b962-00cb25e2070a)

### Weekly Journal

- Click the week number link to open it and generate a page. Provide automation to facilitate retrospectives. Using a weekly journal can help you reflect on your week.
> [Document here](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/wiki/Weekly-Journal)

Sample:

  ![image](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/7c6be831-683d-454f-9950-153e5828fa48)

### Monthly Journal

- Click the link on the left side of the mini calendar to generate a page like `[[2023/10]]` and apply the template.

### Quarterly Journal

> Note: This is only valid if the page title format for Weekly Journal is set to `yyyy/qqq/Www`.
- Access from the hierarchical link of the Monthly or Weekly journal. The page will be generated and the template will be applied.

### Slash Command for week-number

> [Document here](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/wiki/Slash-Command)

---

## Getting Started

Install from Logseq Marketplace
  - Press [`---`] on the top right toolbar to open [`Plugins`]. Select `Marketplace`. Type `Show` in the search field, select it from the search results and install.

   ![image](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/1cecf136-0843-43c9-a315-ba96eb9b34f3)

### Usage

- The style be applied to journals or the single journal page, the right sidebar.
- First, please configure the plugin settings.
  1. Select either US format or ISO format.
     > [Document here](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/wiki/Week-number-format)

---

## Showcase / Questions / Ideas / Help

> Go to the [Discussions](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/discussions) tab to ask and find this kind of things.

- Relation
  1. Localize day of the week in journal links > For languages other than English. Split to [Flexible date format plugin](https://github.com/YU000jp/logseq-plugin-flex-date-format)

## Contribution / Prior art / Credit

- Script > [Show week day and week number - discuss.logseq.com](https://discuss.logseq.com/t/show-week-day-and-week-number/12685/18) @[danilofaria](https://discuss.logseq.com/u/danilofaria/), @[ottodevs](https://discuss.logseq.com/u/ottodevs/)
- Library > [date-fns](https://date-fns.org/)
- LIbrary > [date-holidays](https://github.com/commenthol/date-holidays)
   > Highlighting holidays is now possible thanks to this library.
- Library > [@6tail/ lunar-typescript](https://github.com/6tail/lunar-typescript) for Chinese Lunar
- Library > [@sethyuan/ logseq-l10n](https://github.com/sethyuan/logseq-l10n) for translation
- Icon > [IonutNeagu - svgrepo.com](https://www.svgrepo.com/svg/490868/monday)
- Author > @[YU000jp](https://github.com/YU000jp)
