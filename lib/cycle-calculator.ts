export function calculateCycle(lastPeriodDate: string, cycleLength: number = 28) {
  const lastDate = new Date(lastPeriodDate);
  
  // 1. توقع الدورة القادمة (تاريخ البداية + طول الدورة)
  const nextPeriod = new Date(lastDate);
  nextPeriod.setDate(lastDate.getDate() + cycleLength);

  // 2. توقع التبويض (موعد الدورة القادمة - 14 يوم)
  const ovulation = new Date(nextPeriod);
  ovulation.setDate(nextPeriod.getDate() - 14);

  // 3. نافذة الخصوبة (التبويض +/- 2 يوم)
  const fertileStart = new Date(ovulation);
  fertileStart.setDate(ovulation.getDate() - 2);
  
  const fertileEnd = new Date(ovulation);
  fertileEnd.setDate(ovulation.getDate() + 2);

  // 4. اليوم الحالي في الدورة
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastDate.getTime());
  const currentDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    nextPeriodDate: nextPeriod.toISOString().split('T')[0],
    ovulationDate: ovulation.toISOString().split('T')[0],
    fertileWindow: `${fertileStart.getDate()} - ${fertileEnd.getDate()} ${fertileEnd.toLocaleString('ar-EG', { month: 'short' })}`,
    currentDay: currentDay > cycleLength ? cycleLength : currentDay, // لعدم تجاوز الرقم
    isLate: currentDay > cycleLength,
    daysLeft: Math.max(0, cycleLength - currentDay)
  };
}