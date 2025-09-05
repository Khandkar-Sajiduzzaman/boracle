import { auth } from '@/auth';
import FacultyImport from '@/components/dashboard/facultyImport';
import { redirect } from 'next/navigation';

export default async function DataImportPage() {
  const session = await auth()
  const isAdmin = session?.user?.userrole === 'admin';

  if (!session?.user) {
    redirect('/api/auth/signin?callbackUrl=/dashboard/data-import');
  }

  if (!isAdmin) {
    return (
      <div className="w-full min-h-screen dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Only administrators can access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen dark:bg-slate-900">
      <div className="flex flex-col items-center gap-8 px-4 py-6">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-bold mb-2">Data Import</h1>
          <p className="text-muted-foreground mb-8">
            Import faculty and other data using CSV files. This feature is only available to administrators.
          </p>
          <FacultyImport />
        </div>
      </div>
    </div>
  )
}
