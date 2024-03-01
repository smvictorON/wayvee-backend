import { ValidateStudent } from './validate-student'
import Student from "../../models/Student"

export const CreateStudent = async (
  { name,  phone,  cpf,  address,  email,  rg,  birthdate,  gender }: any,
  images: any,
  user: any
): Promise<{
  message: string,
  newStudent: any
}> => {
  const err = ValidateStudent(name, phone, cpf, email, rg)
  if (err != "")
    throw { message: err };

  let parsedAddress
  try {
    parsedAddress = JSON.parse(address);
  } catch (err) {
    console.log(err)
    throw { message: "Endereço inválido!" };
  }

  const student = new Student({
    name,
    phone,
    cpf,
    address: parsedAddress,
    email,
    rg,
    birthdate,
    gender,
    company: user.company
  })

  images.map((image: any) => student.images.push(image.filename))

  try {
    const newStudent = await student.save()
    return { message: "Aluno cadastrado com sucesso!", newStudent }
  } catch (err) {
    throw err
  }
}