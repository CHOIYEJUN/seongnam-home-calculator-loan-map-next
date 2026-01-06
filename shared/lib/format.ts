export function formatCurrency(amount: number): string {
  if (amount >= 100000000) {
    const 억 = Math.floor(amount / 100000000);
    const 만 = Math.floor((amount % 100000000) / 10000);
    if (만 > 0) {
      return `${억}억 ${만.toLocaleString()}만원`;
    }
    return `${억}억원`;
  } else if (amount >= 10000) {
    const 만 = Math.floor(amount / 10000);
    const 나머지 = amount % 10000;
    if (나머지 > 0) {
      return `${만.toLocaleString()}만 ${나머지.toLocaleString()}원`;
    }
    return `${만.toLocaleString()}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

