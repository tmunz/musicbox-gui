# Musicbox-GUI
**[Try it yourself](https://tmunz.github.io/musicbox-gui/)**

## Development notes

- Run `npm install` to install dependencies.
- Use `npm run start` to start the dev server.
- Use `npm run lint` and `npm run format` to lint and format code.
- `npm run type-check` runs TypeScript checks.

## Adding visualizations

- Create a new folder under `src/app/visualizations/<kebab-name>`.
- Add an `index.ts` exporting a default Visualization object with fields: id (kebab-case), title, artist, design, imgSrc (import or require), description, component, color, settings.
- Export the visualization component from `visualization/<ComponentName>.tsx` and ensure the component name and filename match the exported symbol.
- Update `src/app/visualizations/index.ts` will automatically pick up new folders if you import and include them in the export list.