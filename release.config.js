
var PLUGIN_NAME = 'logseq-plugin-template-typescript'

module.exports = {
    branches: ['main'],
    plugins: [
        ['@semantic-release/commit-analyzer', {
            preset: 'conventionalcommits',
        }],
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        '@semantic-release/git',
        ['@semantic-release/exec', {
            prepareCmd:
                `zip -qq -r ${PLUGIN_NAME}-` + "${nextRelease.version}.zip dist icon.svg package.json README.md LICENSE",
        }],
        ['@semantic-release/github', {
            assets: `${PLUGIN_NAME}-*.zip`,
            fail: false,
            failComment: false,
            failTitle: false,
        }],
    ],
}
