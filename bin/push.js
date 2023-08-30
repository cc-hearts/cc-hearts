#!/usr/bin/env node
const { spawn } = require('child_process')

const git = spawn(
  `export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=socks5://127.0.0.1:7890 && git push`
)

git.stdout.on('data', (data) => {
  console.log(data)
})
