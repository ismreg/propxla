You are building PropXLA - a property intelligence platform for Chennai, India.
Stack: Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase, Mapbox GL JS.
The app has two tabs: Discovery (where should I buy?) and Decision (should I buy this?).
Data is pre-calculated and stored in Supabase. No live satellite processing.
All prices are in Indian Rupees (₹). Areas covered: OMR and ECR corridors, Chennai.
Always use Tailwind for styling. Use App Router conventions (server components by default).
Keep components small and composable. Use TypeScript strictly - no 'any' types.
Supabase client is at src/lib/supabase.ts.
Types are at src/lib/types.ts.
Data fetching functions are at src/lib/data.ts.
