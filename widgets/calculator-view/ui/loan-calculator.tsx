'use client';

import { useState, useEffect, useMemo } from 'react';
import { LoanProduct, RepaymentMethod, TargetGroup } from '@/shared/types/loan';
import { loanProducts } from '@/entities/loan/model/loan-products';
import { calculateLoanRepayment, getRepaymentMethodName } from '@/shared/lib/loan-repayment-calculator';
import { formatCurrency } from '@/shared/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
  CheckCircle2,
  Search,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAppStore } from '@/shared/config/store';
import { CompareModal } from './compare-modal';

// ── 탭 정의 ────────────────────────────────────────────────────
const TABS = [
  { value: 'all',        label: '전체' },
  { value: 'bank',       label: '은행' },
  { value: 'government', label: '정부기금' },
  { value: 'public',     label: '공공임대' },
] as const;

type TabValue = (typeof TABS)[number]['value'];

// ── 라벨 맵 ────────────────────────────────────────────────────
const TARGET_GROUP_LABELS: Record<TargetGroup | 'all', string> = {
  all: '전체',
  general: '일반',
  youth: '청년',
  newlywed: '신혼부부',
  'multi-child': '다자녀',
  senior: '고령자',
};

const RATE_TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  variable: { label: '변동', cls: 'bg-blue-100 text-blue-700' },
  fixed:    { label: '고정', cls: 'bg-green-100 text-green-700' },
  mixed:    { label: '혼합', cls: 'bg-purple-100 text-purple-700' },
};

const TARGET_BADGE: Record<string, { label: string; cls: string }> = {
  youth:        { label: '청년',    cls: 'bg-orange-100 text-orange-700' },
  newlywed:     { label: '신혼부부', cls: 'bg-pink-100 text-pink-700' },
  'multi-child':{ label: '다자녀',  cls: 'bg-teal-100 text-teal-700' },
  senior:       { label: '고령자',  cls: 'bg-gray-100 text-gray-700' },
};

export function LoanCalculator() {
  const {
    selectedProperty,
    selectedUnit,
    setCurrentView,
    loanSortKey,
    setLoanSortKey,
    loanSearchQuery,
    setLoanSearchQuery,
    loanTargetFilter,
    setLoanTargetFilter,
    compareProducts,
    addCompareProduct,
    removeCompareProduct,
  } = useAppStore();

  const [selectedTab, setSelectedTab] = useState<TabValue>('all');
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

  // ── 필터링 + 정렬 ───────────────────────────────────────────
  const filteredAndSortedProducts = useMemo(() => {
    let list = loanProducts.filter((p) => {
      // 탭 필터
      if (selectedTab === 'public') {
        if (p.category !== 'housing' && p.category !== 'public') return false;
      } else if (selectedTab !== 'all') {
        if (p.category !== selectedTab) return false;
      }
      // 검색
      if (loanSearchQuery) {
        const q = loanSearchQuery.toLowerCase();
        if (!p.provider.toLowerCase().includes(q) && !p.name.toLowerCase().includes(q))
          return false;
      }
      // 대상 그룹 필터
      if (loanTargetFilter !== 'all') {
        if (!p.targetGroups.includes(loanTargetFilter as TargetGroup)) return false;
      }
      return true;
    });

    // 정렬
    list = [...list].sort((a, b) => {
      switch (loanSortKey) {
        case 'rateAsc':     return a.interestRateMin - b.interestRateMin;
        case 'rateDesc':    return b.interestRateMin - a.interestRateMin;
        case 'amountDesc':  return b.maxAmount - a.maxAmount;
        case 'amountAsc':   return a.maxAmount - b.maxAmount;
        case 'providerAsc': return a.provider.localeCompare(b.provider, 'ko');
        default:            return 0;
      }
    });

    return list;
  }, [selectedTab, loanSearchQuery, loanTargetFilter, loanSortKey]);

  // ── 추천 상품 (매물 선택 시) ────────────────────────────────
  const recommendedProducts = useMemo(() => {
    if (!selectedUnit) return [];
    return filteredAndSortedProducts
      .filter(
        (p) =>
          (p.category === 'government' || p.category === 'public') &&
          p.maxAmount >= (selectedUnit.jeonsePrice ?? 0) * 0.5
      )
      .slice(0, 2);
  }, [filteredAndSortedProducts, selectedUnit]);

  // ── 대출 계산 결과 ──────────────────────────────────────────
  const calculation = selectedProduct
    ? calculateLoanRepayment(loanAmount, selectedProduct.interestRate, loanPeriod, repaymentMethod)
    : null;

  const handleProductSelect = (product: LoanProduct) => {
    setSelectedProduct(product);
    setLoanPeriod(product.maxPeriod);
    setRepaymentMethod(product.repaymentMethods[0]);
    if (loanAmount > product.maxAmount) {
      setLoanAmount(product.maxAmount);
    }
  };

  const handleReset = () => {
    setSelectedProduct(null);
    setLoanAmount(selectedUnit ? selectedUnit.jeonsePrice * 0.8 : 0);
    setLoanPeriod(24);
    setRepaymentMethod('maturity');
  };

  const isInCompare = (id: string) => compareProducts.some((p) => p.id === id);

  const handleCompareToggle = (product: LoanProduct) => {
    if (isInCompare(product.id)) {
      removeCompareProduct(product.id);
    } else {
      addCompareProduct(product);
    }
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

            <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as TabValue)}>
              <div className="px-4 pt-4">
                <TabsList className="grid w-full grid-cols-4">
                  {TABS.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* 검색 + 정렬 + 필터 바 */}
              <div className="px-4 py-3 space-y-2 border-b">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="은행명 검색..."
                      className="pl-8"
                      value={loanSearchQuery}
                      onChange={(e) => setLoanSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select
                    value={loanSortKey}
                    onValueChange={(v) =>
                      setLoanSortKey(
                        v as 'rateAsc' | 'rateDesc' | 'amountDesc' | 'amountAsc' | 'providerAsc'
                      )
                    }
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rateAsc">금리 낮은 순</SelectItem>
                      <SelectItem value="rateDesc">금리 높은 순</SelectItem>
                      <SelectItem value="amountDesc">한도 큰 순</SelectItem>
                      <SelectItem value="amountAsc">한도 작은 순</SelectItem>
                      <SelectItem value="providerAsc">기관명 순</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 대상 그룹 필터 */}
                <div className="flex gap-1.5 flex-wrap">
                  {(
                    ['all', 'general', 'youth', 'newlywed', 'multi-child', 'senior'] as const
                  ).map((g) => (
                    <button
                      key={g}
                      onClick={() => setLoanTargetFilter(g)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        loanTargetFilter === g
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {TARGET_GROUP_LABELS[g]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 탭 콘텐츠 */}
              {TABS.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-0">
                  <ScrollArea className="h-[520px]">
                    <div className="p-4 space-y-3">
                      {/* 추천 배너 */}
                      {recommendedProducts.length > 0 && selectedTab === tab.value && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-sm font-medium text-amber-800 mb-1.5">
                            💡 이 매물에 적합한 저금리 상품
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {recommendedProducts.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => handleProductSelect(p)}
                                className="text-xs px-2.5 py-1 bg-white border border-amber-300 rounded-full hover:bg-amber-50 transition-colors"
                              >
                                {p.name} ({p.interestRateMin}%)
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 검색 결과 없음 */}
                      {filteredAndSortedProducts.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                          <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          <p>검색 결과가 없습니다</p>
                          <button
                            onClick={() => {
                              setLoanSearchQuery('');
                              setLoanTargetFilter('all');
                            }}
                            className="mt-2 text-primary text-sm underline"
                          >
                            필터 초기화
                          </button>
                        </div>
                      )}

                      {/* 상품 카드 목록 */}
                      {filteredAndSortedProducts.map((product) => {
                        const rateTypeBadge = RATE_TYPE_BADGE[product.interestRateType];
                        const inCompare = isInCompare(product.id);
                        const compareDisabled = !inCompare && compareProducts.length >= 3;

                        return (
                          <div
                            key={product.id}
                            className={`relative rounded-lg border-2 transition-all ${
                              selectedProduct?.id === product.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50 hover:bg-accent'
                            }`}
                          >
                            {/* 비교 체크박스 */}
                            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                              <label className="flex items-center gap-1 cursor-pointer select-none">
                                <Checkbox
                                  checked={inCompare}
                                  disabled={compareDisabled}
                                  onCheckedChange={() => handleCompareToggle(product)}
                                  className="data-[state=checked]:bg-primary"
                                />
                                <span className="text-xs text-muted-foreground">비교</span>
                              </label>
                            </div>

                            <button
                              onClick={() => handleProductSelect(product)}
                              className="w-full text-left p-4 pr-20"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {selectedProduct?.id === product.id && (
                                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                    )}
                                    <h4 className="text-sm font-semibold leading-tight line-clamp-1">
                                      {product.name}
                                    </h4>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {product.provider}
                                  </p>

                                  {/* 배지 행 */}
                                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                    {/* 금리 유형 배지 */}
                                    {rateTypeBadge && (
                                      <span
                                        className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${rateTypeBadge.cls}`}
                                      >
                                        {rateTypeBadge.label}
                                      </span>
                                    )}
                                    {/* 대상 그룹 배지 (general 제외) */}
                                    {product.targetGroups
                                      .filter((g) => g !== 'general')
                                      .map((g) => {
                                        const badge = TARGET_BADGE[g];
                                        if (!badge) return null;
                                        return (
                                          <span
                                            key={g}
                                            className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${badge.cls}`}
                                          >
                                            {badge.label}
                                          </span>
                                        );
                                      })}
                                  </div>

                                  {/* 금리 범위 + 한도 */}
                                  <div className="flex items-center gap-3 mt-2">
                                    <div className="px-2.5 py-1 bg-primary/10 rounded-full">
                                      <span className="text-primary text-xs font-semibold">
                                        {product.interestRateMin}% ~ {product.interestRateMax}%
                                      </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      최대 {formatCurrency(product.maxAmount)}
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2 mt-1" />
                              </div>
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                                {product.description}
                              </p>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
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
                          <Input
                            type="number"
                            value={loanAmount}
                            min={0}
                            max={selectedProduct.maxAmount}
                            step={1000000}
                            onChange={(e) => {
                              const val = Math.max(
                                0,
                                Math.min(Number(e.target.value), selectedProduct.maxAmount)
                              );
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
                            {
                              length:
                                (selectedProduct.maxPeriod - selectedProduct.minPeriod) / 12 + 1,
                            },
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
                            <label htmlFor={method} className="flex-1 cursor-pointer">
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

                    {/* 금리 정보 */}
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <span>적용 금리 범위</span>
                      </div>
                      <p className="text-2xl text-primary">
                        {selectedProduct.interestRateMin}%
                        <span className="text-base"> ~ {selectedProduct.interestRateMax}%</span>
                        <span className="text-base ml-1">연</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        계산은 최저금리({selectedProduct.interestRateMin}%) 기준으로 표시됩니다
                      </p>
                    </div>
                  </div>
                </Card>

                {/* 계산 결과 */}
                {calculation && (
                  <>
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
                          : '매월 납부액'}
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

                    {/* 월별 상환 스케줄 Bar Chart */}
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
                              formatter={(value: number | undefined) => [`${value ?? 0}만원`]}
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

                    {/* 액션 버튼 */}
                    <div className="flex gap-4">
                      <div className="flex-1 relative group">
                        <Button size="lg" className="w-full" disabled>
                          <Wallet className="w-4 h-4 mr-2" />
                          대출 상담 신청
                        </Button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-foreground text-background text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          서비스 준비 중
                        </div>
                      </div>
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

      {/* 비교 모달 (플로팅 바 + Dialog) */}
      <CompareModal />
    </div>
  );
}
