<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface Point {
  x: number
  y: number
}

interface Branch {
  length: number
  angle: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const taskPending = [] as (() => void)[]

const initBranch: Branch = {
  length: 10,
  angle: -Math.PI / 2,
}

let ctx: CanvasRenderingContext2D | null = null

const drawBranch = (startPoint: Point, endPoint: Point) => {
  if (!ctx) return
  ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)'
  ctx.beginPath()
  ctx.moveTo(startPoint.x, startPoint.y)
  ctx.lineTo(endPoint.x, endPoint.y)
  ctx.stroke()
  ctx.closePath()
}

const calcBranch = (angle: number, branch: Branch) => {
  return {
    length: branch.length * (0.8 + 0.4 * Math.random()),
    angle,
  }
}
const calcPoint = (point: Point, initVal: Branch) => {
  const { length, angle } = initVal
  const x = point.x + length * Math.cos(angle)
  const y = point.y + length * Math.sin(angle)
  return { x, y }
}

const startDraw = (startPoint: Point, angle: number, depth = 0) => {
  if (depth < 4 || Math.random() < 0.5)
    taskPending.push(() => step(startPoint, angle + 0.2, depth))
  if (depth < 4 || Math.random() < 0.5)
    taskPending.push(() => step(startPoint, angle - 0.2, depth))
}

const flushTask = () => {
  const task = [...taskPending]
  taskPending.length = 0
  task.forEach((fn) => fn())
}

const step = (startPoint: Point, angle: number, depth = 0) => {
  const endPoint = calcPoint(startPoint, calcBranch(angle, initBranch))
  drawBranch(startPoint, endPoint)
  startDraw(endPoint, angle, depth + 1)
}

const frame = () => {
  if (frame.count % 2 === 0) {
    flushTask()
  }
  frame.count++
  requestAnimationFrame(frame)
}
frame.count = 0
const init = (
  startPoint: Point = { x: 100, y: 100 },
  angle: number = -Math.PI / 2
) => {
  startDraw(startPoint, angle)
}

const _random = () => {
  return 2 * Math.random() - 1
}
onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    canvasRef.value.width = window.innerWidth
    canvasRef.value.height = window.innerHeight
    frame()
    {
      const x = 0
      const y = Math.random() * canvasRef.value.height
      init({ x, y }, (_random() * Math.PI) / 3)
    }
    {
      const x = canvasRef.value.width
      const y = Math.random() * canvasRef.value.height
      init({ x, y }, (-(1 + Math.random()) * Math.PI * 2) / 3)
    }
  }
})
</script>
<template>
  <canvas
    ref="canvasRef"
    width="100%"
    height="100%"
    class="fixed top-0 left-0 z--1 pointer-events-none"
  />
</template>
<style lang="scss"></style>
