import { readdir, writeFile } from 'fs/promises'

export function generateTechsClassificationPlugin(config: {
  dirs: string[]
  output: string
}) {
  return {
    name: 'gen-techs-classification-plugin',
    buildStart() {
      const dirs = config.dirs || []
      const task = dirs.map(async (dir) => {
        const dirOptions = await readdir(dir, { withFileTypes: true })
        return dirOptions
          .filter((option) => option.isDirectory())
          .map((option) => ({
            text: option.name,
            link: `/techs/${option.name}/index`,
          }))
      })

      Promise.all(task).then(async (dirs) => {
        const dirsFlatted = dirs.flat()
        if (config.output) {
          await writeFile(
            config.output,
            `export default ` + JSON.stringify(dirsFlatted, null, 2),
            'utf-8'
          )
        }
      })
    },
  }
}
