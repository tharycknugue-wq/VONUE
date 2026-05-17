/**
 * Validação local de CPF (dígitos verificadores). Não substitui a consulta
 * à Receita Federal — quando RECEITA_FEDERAL_API_KEY estiver disponível,
 * o serviço de verificação deve complementar esta checagem.
 */
export function sanitizeCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

export function isValidCpf(rawCpf: string): boolean {
  const cpf = sanitizeCpf(rawCpf);

  if (cpf.length !== 11) return false;
  // Rejeita sequências repetidas (000..., 111..., etc.)
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcDigit = (length: number): number => {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += Number(cpf[i]) * (length + 1 - i);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return calcDigit(9) === Number(cpf[9]) && calcDigit(10) === Number(cpf[10]);
}
