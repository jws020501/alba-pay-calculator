const won = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

const state = {
  partTime: null,
  severance: null,
  netSalary: null,
};

const fields = {
  hourlyWage: document.querySelector("#hourly-wage"),
  hoursPerDay: document.querySelector("#hours-per-day"),
  daysPerWeek: document.querySelector("#days-per-week"),
  weeks: document.querySelector("#weeks"),
  netPay: document.querySelector("#net-pay"),
  basePay: document.querySelector("#base-pay"),
  weeklyHolidayPay: document.querySelector("#weekly-holiday-pay"),
  grossPay: document.querySelector("#gross-pay"),
  deduction: document.querySelector("#deduction"),
  averageMonthlyWage: document.querySelector("#average-monthly-wage"),
  serviceMonths: document.querySelector("#service-months"),
  severancePay: document.querySelector("#severance-pay"),
  severanceAverage: document.querySelector("#severance-average"),
  severanceMonths: document.querySelector("#severance-months"),
  severanceFormula: document.querySelector("#severance-formula"),
  grossMonthlySalary: document.querySelector("#gross-monthly-salary"),
  salaryNetPay: document.querySelector("#salary-net-pay"),
  salaryTotalDeduction: document.querySelector("#salary-total-deduction"),
  nationalPension: document.querySelector("#national-pension"),
  healthInsurance: document.querySelector("#health-insurance"),
  longTermCare: document.querySelector("#long-term-care"),
  employmentInsurance: document.querySelector("#employment-insurance"),
  incomeTax: document.querySelector("#income-tax"),
};

function numberValue(input) {
  return Math.max(0, Number(input.value) || 0);
}

function getDeductionRate() {
  const checked = document.querySelector('input[name="deduction"]:checked');
  return Number(checked?.dataset.rate || 0);
}

function calculatePartTimePay() {
  const hourlyWage = numberValue(fields.hourlyWage);
  const hoursPerDay = numberValue(fields.hoursPerDay);
  const daysPerWeek = Math.min(7, numberValue(fields.daysPerWeek));
  const weeks = numberValue(fields.weeks);
  const weeklyHours = hoursPerDay * daysPerWeek;
  const basePay = hourlyWage * weeklyHours * weeks;
  const weeklyHolidayHours = weeklyHours >= 15 ? Math.min(8, (weeklyHours / 40) * 8) : 0;
  const weeklyHolidayPay = hourlyWage * weeklyHolidayHours * weeks;
  const grossPay = basePay + weeklyHolidayPay;
  const deduction = grossPay * getDeductionRate();
  const netPay = Math.max(0, grossPay - deduction);

  fields.basePay.textContent = won.format(basePay);
  fields.weeklyHolidayPay.textContent = won.format(weeklyHolidayPay);
  fields.grossPay.textContent = won.format(grossPay);
  fields.deduction.textContent = won.format(deduction);
  fields.netPay.textContent = won.format(netPay);

  state.partTime = { basePay, weeklyHolidayPay, grossPay, deduction, netPay };
  return state.partTime;
}

function calculateSeverancePay() {
  const averageMonthlyWage = numberValue(fields.averageMonthlyWage);
  const serviceMonths = numberValue(fields.serviceMonths);
  const severancePay = serviceMonths < 12 ? 0 : (averageMonthlyWage * serviceMonths) / 12;

  fields.severancePay.textContent = won.format(severancePay);
  fields.severanceAverage.textContent = won.format(averageMonthlyWage);
  fields.severanceMonths.textContent = `${Math.floor(serviceMonths)}개월`;
  fields.severanceFormula.textContent = serviceMonths < 12 ? "1년 미만" : "월 평균임금 × 근속개월 / 12";

  state.severance = { averageMonthlyWage, serviceMonths, severancePay };
  return state.severance;
}

function calculateNetSalary() {
  const grossSalary = numberValue(fields.grossMonthlySalary);
  const nationalPension = grossSalary * 0.045;
  const healthInsurance = grossSalary * 0.03545;
  const longTermCare = healthInsurance * 0.1295;
  const employmentInsurance = grossSalary * 0.009;
  const incomeTax = grossSalary * 0.03;
  const totalDeduction =
    nationalPension + healthInsurance + longTermCare + employmentInsurance + incomeTax;
  const netPay = Math.max(0, grossSalary - totalDeduction);

  fields.salaryNetPay.textContent = won.format(netPay);
  fields.salaryTotalDeduction.textContent = won.format(totalDeduction);
  fields.nationalPension.textContent = won.format(nationalPension);
  fields.healthInsurance.textContent = won.format(healthInsurance);
  fields.longTermCare.textContent = won.format(longTermCare);
  fields.employmentInsurance.textContent = won.format(employmentInsurance);
  fields.incomeTax.textContent = won.format(incomeTax);

  state.netSalary = {
    grossSalary,
    nationalPension,
    healthInsurance,
    longTermCare,
    employmentInsurance,
    incomeTax,
    totalDeduction,
    netPay,
  };
  return state.netSalary;
}

function setActiveTab(tabName) {
  document.querySelectorAll(".tab").forEach((tab) => {
    const isActive = tab.dataset.tab === tabName;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    const isActive = panel.id === `panel-${tabName}`;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });
}

function copyLines(type) {
  if (type === "severance") {
    const result = calculateSeverancePay();
    return [
      "퇴직금 계산 결과",
      `예상 퇴직금: ${won.format(result.severancePay)}`,
      `월 평균임금: ${won.format(result.averageMonthlyWage)}`,
      `근속기간: ${Math.floor(result.serviceMonths)}개월`,
    ];
  }

  if (type === "net-salary") {
    const result = calculateNetSalary();
    return [
      "실수령액 계산 결과",
      `예상 실수령액: ${won.format(result.netPay)}`,
      `월급(세전): ${won.format(result.grossSalary)}`,
      `예상 공제액: ${won.format(result.totalDeduction)}`,
      `국민연금: ${won.format(result.nationalPension)}`,
      `건강보험: ${won.format(result.healthInsurance)}`,
      `장기요양보험: ${won.format(result.longTermCare)}`,
      `고용보험: ${won.format(result.employmentInsurance)}`,
      `소득세: ${won.format(result.incomeTax)}`,
    ];
  }

  const result = calculatePartTimePay();
  return [
    "알바비 계산 결과",
    `예상 실수령액: ${won.format(result.netPay)}`,
    `기본급: ${won.format(result.basePay)}`,
    `주휴수당: ${won.format(result.weeklyHolidayPay)}`,
    `총 지급액: ${won.format(result.grossPay)}`,
    `예상 공제액: ${won.format(result.deduction)}`,
  ];
}

document.querySelectorAll('input[name="deduction"]').forEach((radio) => {
  const rates = { none: 0, tax33: 0.033, insurance: 0.094 };
  radio.dataset.rate = rates[radio.value];
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => setActiveTab(tab.dataset.tab));
});

document.querySelector("#pay-form").addEventListener("input", calculatePartTimePay);
document.querySelector("#pay-form").addEventListener("change", calculatePartTimePay);
document.querySelector("#severance-form").addEventListener("input", calculateSeverancePay);
document.querySelector("#salary-form").addEventListener("input", calculateNetSalary);

document.querySelectorAll(".copy-result").forEach((button) => {
  button.addEventListener("click", async () => {
    const text = copyLines(button.dataset.copy).join("\n");

    await navigator.clipboard.writeText(text);
    button.textContent = "복사 완료";
    window.setTimeout(() => {
      button.textContent = "결과 복사";
    }, 1400);
  });
});

calculatePartTimePay();
calculateSeverancePay();
calculateNetSalary();
