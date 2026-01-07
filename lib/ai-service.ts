// هذه الطبقة تعزل منطق الذكاء الاصطناعي عن الواجهة
// حالياً تعمل بنظام المحاكاة (Mock) لتعمل مجاناً وبسرعة

export interface AIAnalysisResult {
  summary: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  specialty_suggestion: string;
  red_flags: string[];
}

export async function analyzeSymptoms(symptoms: string, age: number, gender: string): Promise<AIAnalysisResult> {
  // هنا يمكن استبدال الكود بطلب API لـ OpenAI أو Gemini
  // simulating API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // منطق بسيط للمحاكاة بناءً على كلمات مفتاحية
  let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let specialty = 'طب عام';
  const redFlags = [];

  if (symptoms.includes('صدر') || symptoms.includes('قلب') || symptoms.includes('نفس')) {
    urgency = 'high';
    specialty = 'قلب وأوعية دموية';
    redFlags.push('اشتباه في مشكلة قلبية تنفسية');
  } else if (symptoms.includes('حرارة') || symptoms.includes('سخونة')) {
    urgency = 'medium';
    specialty = 'باطنة';
  } else if (symptoms.includes('كسر') || symptoms.includes('عظم')) {
    specialty = 'عظام';
  }

  return {
    summary: `بناءً على الأعراض المذكورة (${symptoms}) للمريض (${gender}, ${age} سنة)، يظهر اشتباه مبدئي يتطلب عرضاً على طبيب ${specialty}.`,
    urgency: urgency,
    specialty_suggestion: specialty,
    red_flags: redFlags
  };
}