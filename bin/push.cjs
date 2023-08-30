#!/usr/bin/env node
const { spawn } = require('child_process')

const proxyCommand =
  'export https_proxy=http://127.0.0.1:7890 && export http_proxy=http://127.0.0.1:7890 && export all_proxy=socks5://127.0.0.1:7890'
const gitPushCommand = 'git push'

const proxyProcess = spawn('bash', ['-c', proxyCommand])

proxyProcess.on('exit', (code) => {
  if (code === 0) {
    const gitPushProcess = spawn('bash', ['-c', gitPushCommand])

    gitPushProcess.stdout.on('data', (data) => {
      console.log(data.toString())
    })

    gitPushProcess.stderr.on('data', (data) => {
      console.error(data.toString())
    })

    gitPushProcess.on('close', (code) => {
      console.log(`Git push process exited with code ${code}`)
    })
  } else {
    console.error('Failed to set proxy environment variables')
  }
})
