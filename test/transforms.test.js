const {readImage} = require('./helpers')

jest.setTimeout(15000)

test('[transforms] invert colors', done => {
  readImage('small-landscape.png?invert=1').then(img => {
    expect(img.width).toBe(367)
    expect(img.height).toBe(153)
    expect(img.colorAt(0, 0)).toBe('ff4261')
    done()
  })
})

test('[transforms] color quantization (threshold)', done => {
  readImage('small-landscape.png?colorquant=2').then(img => {
    expect(img.width).toBe(367)
    expect(img.height).toBe(153)
    expect(img.colorAt(0, 0)).toBe('ffffff')
    expect(img.colorAt(120, 120)).toBe('000000')
    done()
  })
})

test('[transforms] saturation (grayscale)', done => {
  readImage('small-landscape.png?sat=-100').then(img => {
    expect(img.width).toBe(367)
    expect(img.height).toBe(153)
    expect(img.colorAt(0, 0)).toBe('a8a8a8')
    expect(img.colorAt(120, 120)).toBe('797979')
    done()
  })
})

test('[transforms] border image (inlaid)', done => {
  readImage('mead.png?border=10,bf1942').then(img => {
    expect(img.width).toBe(512)
    expect(img.height).toBe(512)
    expect(img.colorAt(0, 0)).toBe('bf1942')
    done()
  })
})

test('[transforms] border image with alpha (inlaid)', done => {
  readImage('mead.png?border=10,ccbf1942').then(img => {
    expect(img.width).toBe(512)
    expect(img.height).toBe(512)
    expect(img.colorAt(0, 0)).toBe('be1841')
    done()
  })
})

test('[transforms] pad image', done => {
  readImage('mead.png?bg=bf1942&pad=10').then(img => {
    expect(img.width).toBe(532)
    expect(img.height).toBe(532)
    expect(img.colorAt(0, 0)).toBe('bf1942')
    done()
  })
})

test('[transforms] pad image with alpha color', done => {
  readImage('mead.png?bg=0fff&pad=10')
    .then(img => {
      expect(img.width).toBe(532)
      expect(img.height).toBe(532)
      done()
    })
    .catch(done)
})

test('[transforms] pad image combined with width adjustment', done => {
  readImage('mead.png?bg=bf1942&pad=10&w=256').then(img => {
    expect(img.width).toBe(256)
    expect(img.height).toBe(256)
    expect(img.colorAt(0, 0)).toBe('bf1942')
    expect(img.colorAt(128, 128)).toBe('000000')
    done()
  })
})

// @todo Revisit
test.skip('[transforms] draws focal point debugger', done => {
  readImage('mead.png?fp-y=0.75&fp-x=.25&fp-debug=1&fit=crop').then(img => {
    img.colorAtIsApprox(128, 384, 'c00000')
    done()
  })
})
