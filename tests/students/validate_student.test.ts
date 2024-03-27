import { ValidateStudent } from "../../src/applications/students/validate-student"

describe('ValidateStudent', () => {
  it('should return name error mandatory', function () {
    let res = ValidateStudent("", "", "" , "", "")
    expect(res).toBe("O nome é obrigatório!")
  })

  it('should return tel error mandatory', function () {
    let res = ValidateStudent("nome", "", "" , "", "")
    expect(res).toBe("O telefone é obrigatório!")
  })

  it('should return cpf error mandatory', function () {
    let res = ValidateStudent("nome", "5514999999999", "" , "", "")
    expect(res).toBe("O CPF é obrigatório!")
  })

  it('should return cpf error invalid', function () {
    let res = ValidateStudent("nome", "5514999999999", "000.000.000.00" , "", "")
    expect(res).toBe("O CPF está fora do padrão!")
  })

  it('should return email error invalid', function () {
    let res = ValidateStudent("nome", "5514999999999", "000.000.000-00" , "email$test", "")
    expect(res).toBe("O email está fora do padrão!")
  })

  it('should return rg error invalid', function () {
    let res = ValidateStudent("nome", "5514999999999", "000.000.000-00" , "email@test.com", "00.000.000.0")
    expect(res).toBe("O rg está fora do padrão!")
  })

  it('should return void', function () {
    let res = ValidateStudent("nome", "5514999999999", "000.000.000-00" , "email@test.com", "00.000.000-0")
    expect(res).toBe("")
  })
})