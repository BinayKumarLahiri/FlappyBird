 const canvas = document.getElementById('canvas')
 const bird = document.getElementById('birdLive')
 const ctx = canvas.getContext('2d')
 ctx.imageSmoothingEnabled = false
 canvas.width = canvas.scrollWidth
 canvas.height = canvas.scrollHeight
//Screen and Game Constants
const w = canvas.width
const h = canvas.height
let GameRunning = false
let GameStarted = false
const staggerFrame = 3
let frame = 0
let Score = 0

//Loading Sound Effects
const die = new Audio('./Asset/Sound Efects/die.wav')
const swoosh = new Audio('./Asset/Sound Efects/swoosh.wav')


class Base {
	constructor() {
		this.img = document.getElementById('base')
		this.positionX = [0,w]
		this.height = 96
		this.speed = 2
		this.positionY = h-this.height
	}
	animate() {
		ctx.drawImage(this.img,this.positionX[0],this.positionY,w,this.height)
		ctx.drawImage(this.img,this.positionX[1],this.positionY,w,this.height)
		this.positionX[0] -= this.speed
		this.positionX[1] -= this.speed
		if(this.positionX[0]<=(-w+2))this.positionX[0] = w-10
		if(this.positionX[1]<=(-w+2))this.positionX[1] = w-10
	}
}


//Bird Class
class Bird {
	constructor() {
		this.x = w/10
		this.y = h/3
		this.state = {
			'img' : [
				document.getElementById('birdUp'),
				document.getElementById('birdMid'),
				document.getElementById('birdDown')
				],
			'frames' : 3,
		}
		this.width = 34
		this.height = 34
		this.frame = 0
		this.fallVelocity = 0
		this.gravity = 0.2
		this.direction = 1
	}
	animate() {
		this.fallVelocity += this.gravity;
		this.y += this.fallVelocity * this.direction
		ctx.drawImage(this.state.img[this.frame],this.x,this.y,this.width,this.height)
		this.frame = (this.frame+1)%this.state.frames
	}
	draw() {
		ctx.drawImage(this.state.img[this.frame],this.x,this.y,this.width,this.height)
	}
	die() {
		this.state = {
			'img' : [document.getElementById('birdDown')],
			'frames' : 1,
		}
		this.frame = 0
	}
	collideWithbase(base) {
		if(this.y + this.height >= base.positionY)
			return true
		else return false
	}
	collideWithBar(bar) {
		if((this.x+this.width >= bar.positionX && this.x <= bar.positionX + bar.width) && 
			!(this.y + this.height < bar.positionY && this.y > bar.positionY - bar.gap)){
			return true
		}
		else return false
	}
}

class Background {
	constructor() {
		this.img = document.getElementById('background')
		this.positionX = [0,w]
		this.speed = 1.5
	}
	animate() {
		ctx.drawImage(this.img,this.positionX[0],0,w,h)
		ctx.drawImage(this.img,this.positionX[1],0,w,h)
		this.positionX[0] -= this.speed
		this.positionX[1] -= this.speed
		if(this.positionX[0]<=(-w+2))this.positionX[0] = w-10
		if(this.positionX[1]<=(-w+2))this.positionX[1] = w-10
	}
}




class Bar {
	constructor() {
		this.width = 52
		this.height = 320
		this.positionX = w
		//min positionY = 150
		//max positionY = 350
		this.positionY = Math.random()*(350-150) + 150
		this.img = document.getElementById('pipe')
		this.imgRotate = document.getElementById('pipe-rotate')
		this.gap = 90
		this.speed = 2
		this.angle = (180*Math.PI)/180
	}
	animate() {
		ctx.drawImage(this.img,this.positionX,this.positionY,this.width,this.height)
		ctx.drawImage(this.imgRotate,this.positionX,this.positionY-this.gap-this.height,this.width,this.height)
		this.positionX -= this.speed
		if(this.positionX <= -this.width){
			this.positionX = w
			this.positionY = Math.random()*(350-150) + 150
			Score++
		}
	}
}




class ScoreViewer {
	constructor() {
		this.img = [
			document.getElementById('0'),
			document.getElementById('1'),
			document.getElementById('2'),
			document.getElementById('3'),
			document.getElementById('4'),
			document.getElementById('5'),
			document.getElementById('6'),
			document.getElementById('7'),
			document.getElementById('8'),
			document.getElementById('9'),
		]
		this.x = w/2
		this.y = 60
	}
	draw(score) {
		let s = score.toString()
		let len = s.length
		let position = this.x
		position = position - len * 12
		for(let i=0;i<len;i++) {
			ctx.drawImage(this.img[s[i]-'0'],position,this.y)
			if(s[i]-'0' === 1)position += 16
			else position += 24
		}
	}
}

const bg = new Background()
const base = new Base()
const player = new Bird()
const ScoreCard = new ScoreViewer()
const bars = [new Bar(),new Bar()]
bars[1].positionX = bars[0].positionX + w/2 + bars[0].width - 30

const flap = ()=>{
	if(!GameStarted) {
		GameStarted = true
		GameRunning = true
		player.gravity = 0.2
	}else {
		player.fallVelocity = 0
		player.direction *= -1
		player.gravity *= 30
		swoosh.play()
		setTimeout(()=>{
			player.fallVelocity = 0
			player.direction *= -1
			player.gravity /= 30
		},100)
	}
}
const StartGame = ()=>{
	GameStarted = false
	GameRunning = false
	player.y = h/3
	player.fallVelocity = 0
	bars[0].positionX = w
	bars[1].positionX = bars[0].positionX + w/2 + bars[0].width - 30
}

canvas.addEventListener('click', ()=>{
	flap()
})
window.addEventListener('keydown',(e)=>{
	//console.log(e.key)
	if(e.key === 'ArrowUp' || e.key === ' ')flap()
	else if(e.key === 'Enter')StartGame()
})

const GameOver = ()=>{
	die.play()
	ctx.drawImage(document.getElementById('gameover'),w/2-96,100)
	GameRunning = false
}


//Game Loop
const Game = ()=>{
	frame = (frame+1)%staggerFrame;
	if(frame == 0) {
		if(!GameStarted) {
			ctx.clearRect(0,0,w,h)
			bg.animate()
			base.animate()
			ctx.drawImage(document.getElementById('message'),(w-184)/2,(h-267)/2)
			//console.log(player.y,player.gravity)
		}
		if(GameRunning) {
			ctx.clearRect(0,0,w,h)
			bg.animate()
			bars.forEach(bar=>{
				bar.animate()
				if(player.collideWithBar(bar))GameOver()
			})
			base.animate()
			player.animate()
			if(player.collideWithbase(base))GameOver()
			ScoreCard.draw(Score)
		}
	}
	requestAnimationFrame(Game)
} 
requestAnimationFrame(Game)