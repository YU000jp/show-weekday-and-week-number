# Logseq Plugin: *Show weekday and week-number* 📆

1. Show weekday and week number beside journal titles.
1. Show the mini-calendar that has navigational links on Daily Journal. Provides access to previous and subsequent single journals, and links to weekly Journal and monthly Journal.

[日本語](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/blob/main/readme.ja.md) /
 [![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-show-weekday-and-week-number)](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/releases)
[![License](https://img.shields.io/github/license/YU000jp/logseq-plugin-show-weekday-and-week-number?color=blue)](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/LICENSE)
[![Downloads](https://img.shields.io/github/downloads/YU000jp/logseq-plugin-show-weekday-and-week-number/total.svg)](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/releases) /
 Published 20230526

---

## Options

### Behind Journal Title ➡️

- The week number for that week will be generated. Like below
  1. ![image](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/f47b8948-5e7a-4e16-a5ae-6966672742b1)
  1. ![image](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/ee97c455-714e-45d2-9f9f-905798e298b4)
> Highlight holidays for world country

### Mini-calendar 🗓️ (Journal boundaries)

- Display a 2 lines calendar on journals. Smooth access to previous and subsequent dates on a single date page or journals.
  1. Highlight holidays for world country
  1. Show indicator (dot) of journal entries 🆙
  1. Show Lunar-calendar date for Chinese

![README用](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/114708ab-0389-4c46-b962-00cb25e2070a)

### Weekly Journal (review)

- Click the week number link to open it and generate a page. Provide automation to facilitate retrospectives. Using a weekly journal can help you reflect on your week.
> [Document here](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/wiki/Weekly-Journal)

Sample:

  ![image](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/7c6be831-683d-454f-9950-153e5828fa48)

### Monthly Journal 🌛 / Quarterly Journal

- Click the link on the left side of the mini calendar will open a page like `[[2023/10]]`.
  > There is page generation feature. 🆙

### Slash Command

> Week-number etc.. [Document here](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/wiki/Slash-Command)

---

## Getting Started

Install from Logseq Marketplace
  - Press [`---`] on the top right toolbar to open [`Plugins`]. Select `Marketplace`. Type `Show` in the search field, select it from the search results and install.

   ![image](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/assets/111847207/5c3a2b34-298b-4790-8e12-01d83e289794)

### Usage

1. The style be applied to journals or the single journal page , the right sidebar. First, please configure the plugin settings.
1. 1. Select either US format or ISO format.
   > [Document here](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/wiki/Week-number-format)

---

## Showcase / Questions / Ideas / Help

> Go to the [discussion](https://github.com/YU000jp/logseq-plugin-show-weekday-and-week-number/discussions) tab to ask and find this kind of things.

- Relation
  1. Localize day of the week in journal links > For languages other than English. Split to [Flexible date format plugin](https://github.com/YU000jp/logseq-plugin-flex-date-format)

## Contribution / Prior art / Credit

1. Script > [Show week day and week number - discuss.logseq.com](https://discuss.logseq.com/t/show-week-day-and-week-number/12685/18) @[danilofaria](https://discuss.logseq.com/u/danilofaria/), @[ottodevs](https://discuss.logseq.com/u/ottodevs/)
1. Library > [date-fns](https://date-fns.org/)
1. LIbrary > [date-holidays](https://github.com/commenthol/date-holidays)
   > Highlighting holidays is now possible thanks to the "date-holidays" library.
1. Library > [@6tail/ lunar-typescript](https://github.com/6tail/lunar-typescript) for Chinese Lunar
1. Icon > [IonutNeagu - svgrepo.com](https://www.svgrepo.com/svg/490868/monday)
1. Author > @[YU000jp](https://github.com/YU000jp)

<a href="https://www.buymeacoffee.com/yu000japan"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a pizza&emoji=🍕&slug=yu000japan&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff" /></a>
