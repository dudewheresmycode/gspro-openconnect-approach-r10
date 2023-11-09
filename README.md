# gspro-openconnect-approach-r10

A GSPro Connect app for Garmin Approach R10 launch monitors.

- [Documentation](https://aguywithideas.com/gspro-openconnect-approach-r10/)
- [Development](#development)
- [Releasing](#releasing)

## Development

If you'd like to develop this project, you can checkout and run the app with the following commands.

Prerequisites:

- `git`
- [`node` + `npm`](https://nodejs.org/en/download/)

Clone the repo to your local machine:

```bash
git clone https://github.com/dudewheresmycode/gspro-openconnect-approach-r10
cd gspro-openconnect-approach-r10
```

Install the dependencies:

```bash
npm install
```

Start the app locally:

```bash
npm start
```

#### Building Documantation Locally

```bash
docker run --rm \
  --volume="$PWD/docs:/srv/jekyll" \
  -p 4000:4000 \
  jekyll/jekyll:3 \
  sh -c "gem install jekyll bundler && bundle install && jekyll serve --watch --verbose"

docker run --rm \
  --volume="$PWD/docs:/srv/jekyll" \
  -p 4000:4000 \
  jekyll/jekyll:3 \
  jekyll serve --watch --verbose
```

### Releasing

1. Update the version in your project's package.json file (e.g. `1.2.3`)
2. Commit that change (`git commit -am v1.2.3`)
3. Tag your commit (`git tag v1.2.3`). Make sure your tag name's format is `v*.*.*`. Your workflow will use this tag to detect when to create a release
4. Push your changes to GitHub (`git push && git push --tags`)

Source: https://github.com/marketplace/actions/electron-builder-action#releasing

### Credits

- Heavily based on the fantastic work of @travislang's [`gspro-garmin-connect-v2`](https://github.com/travislang/gspro-garmin-connect-v2)
- https://gsprogolf.com/GSProConnectV1.html
