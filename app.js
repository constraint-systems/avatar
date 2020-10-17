import state from '/m/state.js'
import { lookAt, perspective } from '/m/mat4.js'
import { createCamera } from '/m/camera.js'

let $texture = document.querySelector('#texture')
$texture.width = 2048
$texture.height = 2048
let cx = $texture.getContext('2d')
cx.fillStyle = '#000'
cx.fillRect(0, 0, $texture.width, $texture.height)

let urls = [
  'akira.jpg',
  'bowie.jpg',
  'fka.jpg',
  'exmachina.jpeg',
  'yyy.jpg',
  'uncut.jpg',
]
let text_w = 512
let text_h = 384
for (let i = 0; i < urls.length; i++) {
  let url = urls[i]
  let img = document.createElement('img')
  if (i < 4) {
    img.onload = function() {
      cx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        i * text_w,
        0,
        text_w,
        text_h
      )
    }
  } else {
    img.onload = function() {
      cx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        (i - 4) * text_w,
        text_h,
        text_w,
        text_w
      )
    }
  }
  img.src = '/test_images/' + url
}

window.addEventListener('load', () => {
  let $render = document.querySelector('#render')
  $render.width = window.innerWidth
  $render.height = window.innerHeight
  let regl = createREGL($render)
  state.regl = regl

  let camera = createCamera(regl, { center: [0, 0, 0], distance: 4 })

  let texture = regl.texture($texture)

  let xc = 0.5 + 1 / 3 / 2
  let yc = 0.5
  var cubePosition = [
    [-xc, +yc, +xc],
    [+xc, +yc, +xc],
    [+xc, -yc, +xc],
    [-xc, -yc, +xc], // positive z face.
    [+xc, +yc, +xc],
    [+xc, +yc, -xc],
    [+xc, -yc, -xc],
    [+xc, -yc, +xc], // positive x face
    [+xc, +yc, -xc],
    [-xc, +yc, -xc],
    [-xc, -yc, -xc],
    [+xc, -yc, -xc], // negative z face
    [-xc, +yc, -xc],
    [-xc, +yc, +xc],
    [-xc, -yc, +xc],
    [-xc, -yc, -xc], // negative x face.
    [-xc, +yc, -xc],
    [+xc, +yc, -xc],
    [+xc, +yc, +xc],
    [-xc, +yc, +xc], // top face
    [-xc, -yc, -xc],
    [+xc, -yc, -xc],
    [+xc, -yc, +xc],
    [-xc, -yc, +xc], // bottom face
  ]

  let twn = text_w / 2048
  let twn0 = 0
  let twn1 = twn
  let twn2 = twn * 2
  let twn3 = twn * 3
  let twn4 = twn * 4
  let thn = text_h / 2048
  let thn0 = 0
  let thn1 = thn
  let thn2 = thn + twn
  let thn3 = thn + twn + thn
  let thn4 = thn + twn + thn + twn

  var cubeUv = [
    [twn0, thn0],
    [twn1, thn0],
    [twn1, thn1],
    [twn0, thn1], // positive z face.
    [twn1, thn0],
    [twn2, thn0],
    [twn2, thn1],
    [twn1, thn1], // positive x face.
    [twn2, thn0],
    [twn3, thn0],
    [twn3, thn1],
    [twn2, thn1], // negative z face.
    [twn3, thn0],
    [twn4, thn0],
    [twn4, thn1],
    [twn3, thn1], // negative x face.
    [twn0, thn1],
    [twn1, thn1],
    [twn1, thn2],
    [twn0, thn2], // top face
    [twn1, thn1],
    [twn2, thn1],
    [twn2, thn2],
    [twn1, thn2], // bottom face
  ]

  const cubeElements = [
    [2, 1, 0],
    [2, 0, 3], // positive z face.
    [6, 5, 4],
    [6, 4, 7], // positive x face.
    [10, 9, 8],
    [10, 8, 11], // negative z face.
    [14, 13, 12],
    [14, 12, 15], // negative x face.
    [18, 17, 16],
    [18, 16, 19], // top face.
    [20, 21, 22],
    [23, 20, 22], // bottom face
  ]

  let drawBack = regl({
    frag: `precision mediump float;
      varying vec2 vUv;
      uniform sampler2D tex;
      void main () {
        gl_FragColor = texture2D(tex,vUv);
      }`,
    vert: `precision mediump float;
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.9999, 1);
      }`,
    attributes: {
      position: [
        [
          [-1, +1],
          [+1, +1],
          [-1, -1],
        ],
        [
          [+1, +1],
          [+1, -1],
          [-1, -1],
        ],
      ],
      uv: [
        [
          [0, 0],
          [1, 0],
          [0, 1],
        ],
        [
          [1, 0],
          [1, 1],
          [0, 1],
        ],
      ],
    },
    uniforms: {
      tex: texture,
    },
    count: 6,
  })

  let drawCube = regl({
    frag: `
      precision mediump float;
      varying vec2 vUv;
      uniform sampler2D tex;
      void main () {
        gl_FragColor = texture2D(tex,vUv);
      }`,
    vert: `
      precision mediump float;
      attribute vec3 position;
      attribute vec2 uv;
      varying vec2 vUv;
      uniform mat4 projection, view;
      void main() {
        vUv = uv;
        gl_Position = projection * view * vec4(position, 1);
      }`,
    attributes: {
      position: cubePosition,
      uv: cubeUv,
    },
    elements: cubeElements,
    uniforms: {
      tex: regl.prop('texture'),
    },
  })

  regl.clear({
    color: [0, 0, 0, 255],
    depth: 1,
  })
  // drawBack()
  // drawCube({ texture })
  regl.frame(() => {
    regl.clear({
      color: [0, 0, 0, 0],
      depth: 1,
    })
    camera(() => {
      drawCube({ texture })
    })
  })
})
