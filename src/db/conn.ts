import mongoose from 'mongoose'

const main = async () => {
  await mongoose.connect('mongodb://localhost:27017/wayvee')
  console.log('Conectou com Mongoose!')
}

main().catch((err) => console.log(err))

export default mongoose
