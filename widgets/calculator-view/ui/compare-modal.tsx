'use client';

import { useState } from 'react';
import { LoanProduct } from '@/shared/types/loan';
import { useAppStore } from '@/shared/config/store';
import { formatCurrency } from '@/shared/lib/format';
import { calculateLoanRepayment } from '@/shared/lib/loan-repayment-calculator';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const RATE_TYPE_LABEL: Record<string, string> = {
  variable: '변동',
  fixed: '고정',
  mixed: '혼합',
};

const TARGET_GROUP_LABEL: Record<string, string> = {
  general: '일반',
  youth: '청년',
  newlywed: '신혼부부',
  'multi-child': '다자녀',
  senior: '고령자',
};

function computeMonthlyAndTotal(product: LoanProduct, jeonsePrice: number) {
  const amount = Math.min(jeonsePrice * 0.8, product.maxAmount);
  if (amount <= 0) return { monthly: 0, totalInterest: 0, amount };
  const result = calculateLoanRepayment(amount, product.interestRateMin, product.maxPeriod, 'maturity');
  return { monthly: result.monthlyPayment, totalInterest: result.totalInterest, amount };
}

function highlight(values: (number | null)[], idx: number, mode: 'min' | 'max'): boolean {
  const defined = values.filter((v): v is number => v !== null);
  if (defined.length < 2) return false;
  const target = mode === 'min' ? Math.min(...defined) : Math.max(...defined);
  return values[idx] === target;
}

export function CompareModal() {
  const { compareProducts, clearCompareProducts, removeCompareProduct, selectedUnit } =
    useAppStore();
  const [open, setOpen] = useState(false);

  if (compareProducts.length === 0) return null;

  const jeonsePrice = selectedUnit?.jeonsePrice ?? 0;
  const calcs = compareProducts.map((p) => computeMonthlyAndTotal(p, jeonsePrice));

  const minRates = compareProducts.map((p) => p.interestRateMin);
  const maxRates = compareProducts.map((p) => p.interestRateMax);
  const amounts = compareProducts.map((p) => p.maxAmount);
  const monthlies = calcs.map((c) => c.monthly);
  const interests = calcs.map((c) => c.totalInterest);

  return (
    <>
      {/* 하단 플로팅 바 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-primary text-primary-foreground rounded-full px-6 py-3 shadow-xl flex items-center gap-4">
          <span className="text-sm font-medium">{compareProducts.length}개 상품 선택됨</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setOpen(true)}
            className="rounded-full"
          >
            비교하기
          </Button>
          <button
            onClick={clearCompareProducts}
            className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            aria-label="비교 초기화"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 비교 모달 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>상품 비교</DialogTitle>
          </DialogHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-muted-foreground w-32">항목</th>
                  {compareProducts.map((p) => (
                    <th key={p.id} className="p-3 text-center min-w-[160px]">
                      <div className="font-semibold leading-tight">{p.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{p.provider}</div>
                      <button
                        onClick={() => removeCompareProduct(p.id)}
                        className="mt-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        제거
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 최저 금리 */}
                <tr className="border-b hover:bg-muted/30">
                  <td className="p-3 font-medium text-muted-foreground">최저 금리</td>
                  {compareProducts.map((p, i) => (
                    <td
                      key={p.id}
                      className={`p-3 text-center font-semibold ${
                        highlight(minRates, i, 'min')
                          ? 'text-green-700 bg-green-50'
                          : ''
                      }`}
                    >
                      {p.interestRateMin}%
                    </td>
                  ))}
                </tr>

                {/* 최고 금리 */}
                <tr className="border-b hover:bg-muted/30">
                  <td className="p-3 font-medium text-muted-foreground">최고 금리</td>
                  {compareProducts.map((p, i) => (
                    <td
                      key={p.id}
                      className={`p-3 text-center ${
                        highlight(maxRates, i, 'min')
                          ? 'text-green-700 bg-green-50'
                          : ''
                      }`}
                    >
                      {p.interestRateMax}%
                    </td>
                  ))}
                </tr>

                {/* 금리 유형 */}
                <tr className="border-b hover:bg-muted/30">
                  <td className="p-3 font-medium text-muted-foreground">금리 유형</td>
                  {compareProducts.map((p) => (
                    <td key={p.id} className="p-3 text-center">
                      {RATE_TYPE_LABEL[p.interestRateType] ?? p.interestRateType}
                    </td>
                  ))}
                </tr>

                {/* 최대 한도 */}
                <tr className="border-b hover:bg-muted/30">
                  <td className="p-3 font-medium text-muted-foreground">최대 한도</td>
                  {compareProducts.map((p, i) => (
                    <td
                      key={p.id}
                      className={`p-3 text-center ${
                        highlight(amounts, i, 'max')
                          ? 'text-blue-700 bg-blue-50'
                          : ''
                      }`}
                    >
                      {formatCurrency(p.maxAmount)}
                    </td>
                  ))}
                </tr>

                {/* 대출 기간 */}
                <tr className="border-b hover:bg-muted/30">
                  <td className="p-3 font-medium text-muted-foreground">대출 기간</td>
                  {compareProducts.map((p) => (
                    <td key={p.id} className="p-3 text-center">
                      최대 {p.maxPeriod}개월
                    </td>
                  ))}
                </tr>

                {/* 대상 */}
                <tr className="border-b hover:bg-muted/30">
                  <td className="p-3 font-medium text-muted-foreground">대상</td>
                  {compareProducts.map((p) => (
                    <td key={p.id} className="p-3 text-center">
                      {p.targetGroups
                        .map((g) => TARGET_GROUP_LABEL[g] ?? g)
                        .join(' · ')}
                    </td>
                  ))}
                </tr>

                {/* 월 예상 납입 */}
                <tr className="border-b hover:bg-muted/30">
                  <td className="p-3 font-medium text-muted-foreground">
                    월 예상 납입
                    {jeonsePrice > 0 && (
                      <div className="text-xs text-muted-foreground font-normal mt-0.5">
                        전세가 {formatCurrency(jeonsePrice)} 기준
                      </div>
                    )}
                  </td>
                  {compareProducts.map((p, i) => (
                    <td
                      key={p.id}
                      className={`p-3 text-center font-semibold ${
                        calcs[i].amount > 0 && highlight(monthlies, i, 'min')
                          ? 'text-green-700 bg-green-50'
                          : ''
                      }`}
                    >
                      {calcs[i].amount > 0
                        ? formatCurrency(calcs[i].monthly)
                        : '—'}
                    </td>
                  ))}
                </tr>

                {/* 총 이자 */}
                <tr className="hover:bg-muted/30">
                  <td className="p-3 font-medium text-muted-foreground">총 이자</td>
                  {compareProducts.map((p, i) => (
                    <td
                      key={p.id}
                      className={`p-3 text-center ${
                        calcs[i].amount > 0 && highlight(interests, i, 'min')
                          ? 'text-green-700 bg-green-50'
                          : ''
                      }`}
                    >
                      {calcs[i].amount > 0
                        ? formatCurrency(calcs[i].totalInterest)
                        : '—'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {jeonsePrice > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              * 월 예상 납입 및 총 이자는 전세가의 80% 또는 상품 최대 한도(최저값) 기준, 만기일시상환으로 계산한 참고값입니다.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
