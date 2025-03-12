function createSnowflakes(ctx, width, height) {
  const flakes = []
  const maxFlakes = 40

  class Snowflake {
    constructor() {
      this.reset()
    }

    reset() {
      this.x = Math.random() * width
      this.y = -10
      this.size = Math.random() * 6 + 4
      this.speed = Math.random() * 2 + 1
      this.angle = Math.random() * Math.PI * 2
    }

    update() {
      this.y += this.speed
      this.x += Math.cos(this.angle) * 1.5
      if (this.y > height) this.reset()
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height)
    flakes.forEach(flake => {
      flake.update()
      ctx.beginPath()
      ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(200,200,200,0.9)'
      ctx.fill()
    })
    setTimeout(draw, 1000 / 60) // 60 FPS
  }

  for (let i = 0; i < maxFlakes; i++) flakes.push(new Snowflake())
  draw()
}

module.exports = { createSnowflakes }