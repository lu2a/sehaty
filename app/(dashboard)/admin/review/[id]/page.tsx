./node_modules/@supabase/supabase-js/dist/index.mjs
./node_modules/@supabase/ssr/dist/index.mjs
   Linting and checking validity of types ...
Failed to compile.
./app/(dashboard)/admin/review/[id]/page.tsx:29:32
Type error: Property 'doctor_rate' does not exist on type 'never'.
  27 |       if (consultation) {
  28 |         setData(consultation);
> 29 |         setRating(consultation.doctor_rate || 0);
     |                                ^
  30 |         setConsultantNote(consultation.consultant_note || '');
  31 |       }
  32 |     }
