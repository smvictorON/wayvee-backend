const mongoose = require('mongoose')

main = async () => {
  await mongoose.connect('mongodb://localhost:27017/getapet')
  console.log('Conectou com Mongoose!')
}

main().catch((err) => console.log(err))

module.exports = mongoose
