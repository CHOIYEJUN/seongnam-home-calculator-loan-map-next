'use client';

import { useState, useEffect } from 'react';
import { LoanProduct, LoanCategory, RepaymentMethod } from '@/shared/types/loan';
import { loanProducts } from '@/entities/loan/model/loan-products';
import { calculateLoanRepayment, getRepaymentMethodName } from '@/shared/lib/loan-repayment-calculator';
import { formatCurrency } from '@/shared/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Building2,
  Home,
  ArrowLeft,
  Calculator,
  TrendingUp,
  Wallet,
  Info,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useAppStore } from '@/shared/config/store';

export function LoanCalculator() {
  const { selectedProperty, selectedUnit, setCurrentView } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<LoanCategory>('bank');
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null);
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [loanPeriod, setLoanPeriod] = useState<number>(24);
  const [repaymentMethod, setRepaymentMethod] = useState<RepaymentMethod>('maturity');

  // selectedUnit이 변경되면 loanAmount 초기화
  useEffect(() => {
    if (selectedUnit) {
      setLoanAmount(selectedUnit.jeonsePrice * 0.8);
    }
  }, [selectedUnit]);

  // 선택된 카테고리의 대출 상품 필터링
  const filteredProducts = loanProducts.filter(p => p.category === selectedCategory);

  // 대출 계산 결과
  const calculation = selectedProduct
    ? calculateLoanRepayment(loanAmount, selectedProduct.interestRate, loanPeriod, repaymentMethod)
    : null;

  const handleProductSelect = (product: LoanProduct) => {
    setSelectedProduct(product);
    // 상품 선택 시 기본값 설정
    setLoanPeriod(product.maxPeriod);
    setRepaymentMethod(product.repaymentMethods[0]);
    // 대출 한도를 초과하지 않도록 조정
    if (loanAmount > product.maxAmount) {
      setLoanAmount(product.maxAmount);
    }
  };

  // WO-03: 다른 조건으로 계산 — 상품 선택 초기화
  const handleReset = () => {
    setSelectedProduct(null);
    setLoanAmount(selectedUnit ? selectedUnit.jeonsePrice * 0.8 : 0);
    setLoanPeriod(24);
    setRepaymentMethod('maturity');
  };

  if (!selectedProperty || !selectedUnit) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted">
        <div className="text-center">
          <p className="text-muted-foreground">매물을 먼저 선택해주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary/5">
      <div className="max-w-7xl mx-auto p-6">
        {/* 헤더 */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setCurrentView('map')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            지도로 돌아가기
          </Button>

          <Card className="p-6 bg-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedProperty.name}</h2>
                <p className="text-muted-foreground mt-1">{selectedProperty.address}</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedUnit.area}평</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedProperty.type === 'apartment' ? '아파트' : '오피스텔'}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">전세가</p>
                <p className="text-primary mt-1">{formatCurrency(selectedUnit.jeonsePrice)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 대출 상품 선택 */}
          <Card className="lg:col-span-1 bg-white">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">대출 상품 선택</h3>
              <p className="text-muted-foreground text-sm mt-1">
                원하시는 대출 상품을 선택해주세요
              </p>
            </div>

            <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as LoanCategory)}>
              <div className="px-6 pt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="bank">은행</TabsTrigger>
                  <TabsTrigger value="housing">주택공사</TabsTrigger>
                  <TabsTrigger value="government">정부</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value={selectedCategory} className="mt-0">
                <ScrollArea className="h-[600px]">
                  <div className="p-4 space-y-3">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedProduct?.id === product.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-accent'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {selectedProduct?.id === product.id && (
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                              )}
                              <h4 className="text-base font-medium line-clamp-1">{product.name}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {product.provider}
                            </p>
                            <div className="flex items-center gap-3 mt-3">
                              <div className="px-3 py-1 bg-primary/10 rounded-full">
                                <span className="text-primary">
                                  {product.interestRate}%
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                최대 {formatCurrency(product.maxAmount)}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-2" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {product.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </Card>

          {/* 오른쪽: 대출 조건 및 계산 결과 */}
          <div className="lg:col-span-2 space-y-6">
            {selectedProduct ? (
              <>
                {/* 대출 조건 설정 */}
                <Card className="p-6 bg-white">
                  <h3 className="text-lg font-semibold mb-6">대출 조건 설정</h3>

                  <div className="space-y-6">
                    {/* 대출 금액 */}
                    <div className="space-y-2">
                      <Label>대출 금액</Label>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          {/* WO-10: min=0, max, 음수 방어 */}
                          <Input
                            type="number"
                            value={loanAmount}
                            min={0}
                            max={selectedProduct.maxAmount}
                            step={1000000}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(Number(e.target.value), selectedProduct.maxAmount));
                              setLoanAmount(val);
                            }}
                          />
                        </div>
                        <div className="flex items-center px-4 bg-accent rounded-md">
                          <span>{formatCurrency(loanAmount)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        최대 {formatCurrency(selectedProduct.maxAmount)}까지 가능
                      </p>
                    </div>

                    {/* 대출 기간 */}
                    <div className="space-y-2">
                      <Label>대출 기간</Label>
                      <Select
                        value={String(loanPeriod)}
                        onValueChange={(v) => setLoanPeriod(Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(
                            { length: (selectedProduct.maxPeriod - selectedProduct.minPeriod) / 12 + 1 },
                            (_, i) => selectedProduct.minPeriod + i * 12
                          ).map((months) => (
                            <SelectItem key={months} value={String(months)}>
                              {months}개월 ({months / 12}년)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 상환 방법 */}
                    <div className="space-y-3">
                      <Label>상환 방법</Label>
                      <RadioGroup
                        value={repaymentMethod}
                        onValueChange={(v) => setRepaymentMethod(v as RepaymentMethod)}
                      >
                        {selectedProduct.repaymentMethods.map((method) => (
                          <div key={method} className="flex items-center space-x-2">
                            <RadioGroupItem value={method} id={method} />
                            <label
                              htmlFor={method}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="flex items-center justify-between p-3 rounded-md hover:bg-accent transition-colors">
                                <span>{getRepaymentMethodName(method)}</span>
                                <span className="text-sm text-muted-foreground">
                                  {method === 'maturity' && '만기에 원금 일시 상환'}
                                  {method === 'equal-principal' && '원금 동일, 이자 감소'}
                                  {method === 'equal-payment' && '매월 동일 금액'}
                                </span>
                              </div>
                            </label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* 금리 정보 — WO-05: primary 토큰 사용 */}
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <span>적용 금리</span>
                      </div>
                      <p className="text-2xl text-primary">
                        {selectedProduct.interestRate}% <span className="text-base">연</span>
                      </p>
                    </div>
                  </div>
                </Card>

                {/* 계산 결과 */}
                {calculation && (
                  <>
                    {/* WO-05: 그라디언트 카드 — primary 토큰 */}
                    <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-white/20 rounded-lg">
                          <Calculator className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-primary-foreground">월 상환액</h3>
                          <p className="text-primary-foreground/70 text-sm">
                            {getRepaymentMethodName(repaymentMethod)} 기준
                          </p>
                        </div>
                      </div>

                      <p className="text-4xl mb-2">
                        {formatCurrency(calculation.monthlyPayment)}
                      </p>
                      <p className="text-primary-foreground/70">
                        {repaymentMethod === 'maturity'
                          ? '매월 이자만 납부 (만기에 원금 상환)'
                          : '매월 납부액'
                        }
                      </p>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-6 bg-white">
                        <p className="text-muted-foreground mb-2">총 상환 금액</p>
                        <p className="text-2xl">{formatCurrency(calculation.totalPayment)}</p>
                      </Card>
                      <Card className="p-6 bg-white">
                        <p className="text-muted-foreground mb-2">총 이자</p>
                        <p className="text-2xl text-orange-600">
                          {formatCurrency(calculation.totalInterest)}
                        </p>
                      </Card>
                      <Card className="p-6 bg-white">
                        <p className="text-muted-foreground mb-2">대출 원금</p>
                        <p className="text-2xl text-primary">
                          {formatCurrency(calculation.loanAmount)}
                        </p>
                      </Card>
                    </div>

                    {/* WO-11: 월별 상환 스케줄 Bar Chart */}
                    {calculation.schedule && calculation.schedule.length > 0 && (
                      <Card className="p-6 bg-white">
                        <h3 className="text-lg font-semibold mb-4">월별 상환 스케줄</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          원금과 이자의 월별 납부 구성을 확인하세요
                        </p>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={calculation.schedule.map((item) => ({
                              month: `${item.month}월`,
                              원금: Math.round(item.principal / 10000),
                              이자: Math.round(item.interest / 10000),
                            }))}
                            margin={{ top: 4, right: 16, left: 16, bottom: 4 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis
                              dataKey="month"
                              tick={{ fontSize: 11 }}
                              interval={Math.floor(calculation.schedule.length / 6)}
                            />
                            <YAxis
                              tick={{ fontSize: 11 }}
                              tickFormatter={(v: number) => `${v}만`}
                            />
                            <Tooltip
                              formatter={(value: number | undefined) => [`${value || 0}만원`]}
                              labelStyle={{ fontWeight: 600 }}
                            />
                            <Legend />
                            <Bar dataKey="원금" stackId="a" fill="hsl(221 83% 53%)" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="이자" stackId="a" fill="hsl(38 92% 50%)" radius={[3, 3, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Card>
                    )}

                    {/* 대출 조건 */}
                    <Card className="p-6 bg-white">
                      <h4 className="text-base font-medium mb-4">대출 조건</h4>
                      <div className="space-y-2 text-sm">
                        {selectedProduct.conditions.map((condition, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                            <span className="text-muted-foreground">{condition}</span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* 유의사항 */}
                    <Card className="p-6 bg-amber-50 border-amber-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <Info className="w-5 h-5 text-amber-600" />
                        </div>
                        <h4 className="text-base font-medium">유의사항</h4>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• 본 계산 결과는 참고용이며, 실제 대출 조건은 금융기관과 상담 후 결정됩니다.</p>
                        <p>• 개인의 신용도, 소득, DSR 비율 등에 따라 대출 한도와 금리가 달라질 수 있습니다.</p>
                        <p>• 중도상환 수수료, 인지세 등 부대비용이 추가로 발생할 수 있습니다.</p>
                        <p>• 정확한 대출 상담은 해당 금융기관에 문의하시기 바랍니다.</p>
                      </div>
                    </Card>

                    {/* WO-03: 액션 버튼 */}
                    <div className="flex gap-4">
                      {/* 대출 상담 신청 — 서비스 준비 중 (disabled) */}
                      <div className="flex-1 relative group">
                        <Button size="lg" className="w-full" disabled>
                          <Wallet className="w-4 h-4 mr-2" />
                          대출 상담 신청
                        </Button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-foreground text-background text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          서비스 준비 중
                        </div>
                      </div>
                      {/* 다른 조건으로 계산 */}
                      <Button size="lg" variant="outline" className="flex-1" onClick={handleReset}>
                        <Calculator className="w-4 h-4 mr-2" />
                        다른 조건으로 계산
                      </Button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <Card className="p-12 bg-white">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="p-4 bg-accent rounded-full mb-4">
                    <Calculator className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">대출 상품을 선택해주세요</h3>
                  <p className="text-muted-foreground">
                    좌측에서 원하시는 대출 상품을 선택하시면
                    <br />
                    상세한 계산 결과를 확인하실 수 있습니다.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
