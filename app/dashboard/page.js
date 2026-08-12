import { Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { ApplicationTable } from '@/components/ApplicationTable';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { NavUser } from '@/components/nav-user';

// Ensure this page is dynamically rendered to fetch fresh data
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function DashboardPage(props) {
  const searchParams = await props.searchParams;
  const streamParam = searchParams?.stream || "all";

  const { data: applications, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Supabase fetch error:", error);
  }

  const cleanStreamName = streamParam.replace(/^Stream\s+\d+\s*\((.*?)\)$/i, '$1');

  const title = streamParam === "all" ? "DCAA Applications" : `${cleanStreamName} Applications`;
  const description = streamParam === "all" 
    ? "Review and manage all incoming applications from your WordPress Fluent Forms integration."
    : `Review and manage incoming applications for the ${cleanStreamName} stream.`;

  return (
    <AppShell sidebar={<Suspense fallback={<div className="h-full bg-sidebar" />}><AppSidebar /></Suspense>}>
      {/* Mobile Header Bar */}
      <div className="flex items-center justify-between mb-4 md:hidden">
        <SidebarTrigger className="-ml-2" />
        <NavUser />
      </div>
      
      <div className="flex items-start justify-between mb-8 gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-bold text-3xl text-foreground font-heading">
            {title}
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            {description}
          </p>
        </div>
        <div className="hidden md:block shrink-0">
          <NavUser />
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          Error loading applications. Please check your Supabase connection.
        </div>
      ) : (
        <Suspense fallback={<div className="flex items-center justify-center h-64 border border-dashed rounded-xl border-hairline bg-canvas"><p className="text-muted-foreground font-medium">Loading applications...</p></div>}>
          <ApplicationTable applications={applications || []} />
        </Suspense>
      )}
    </AppShell>
  );
}
