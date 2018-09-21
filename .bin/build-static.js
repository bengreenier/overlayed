const copy = require('recursive-copy')

copy(__dirname + '/../src', 'dist', {
  overwrite: true,
  filter: ['!dist**', '!node_modules**', '**/*.html', '**/package.json']
}).then(() => {
  // success, exit 0
  process.exit(0)
}, (err) => {
  // log error, exit failure
  console.error(err)
  process.exit(-1)
})