import { statSync, writeFileSync } from "fs";

export function readFileCTimes(path:string) {
  const stat = statSync(path)
  const time = stat.birthtime
  return new Date(time).toISOString().split('T')[0]
}

export function writeFile(path:string, content:string) {
  writeFileSync(path, content)
  console.log(`write ${path} success!`);
}