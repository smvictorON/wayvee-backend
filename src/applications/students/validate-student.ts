export const ValidateStudent = (name: any, phone: any, cpf: any, email: any, rg: any): string => {
  if (!name)
    return "O nome é obrigatório!"

  if (!phone)
    return "A telefone é obrigatório!"

  if (!cpf)
    return "O CPF é obrigatório!"

  const cpfRegex = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;
  const isValidCpf = cpfRegex.test(cpf);

  if (!isValidCpf)
    return "O CPF está fora do padrão!"

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = emailRegex.test(email);

    if (!isValidEmail)
      return "O email está fora do padrão!"
  }

  if (rg) {
    const rgRegex = /^\d{1,2}\.\d{3}\.\d{3}\-[\d|X]$/;
    const isValidRg = rgRegex.test(rg.toUpperCase());

    if (!isValidRg)
      return "O rg está fora do padrão!"
  }

  return ""
}