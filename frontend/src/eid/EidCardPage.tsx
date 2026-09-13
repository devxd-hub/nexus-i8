import React from 'react';
import { RouterProvider, useRouter } from './router';
import { MemberProfilePage } from './components/MemberProfilePage';

function EidCardContent() {
  const { route } = useRouter();

  return (
    <div className="h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full bg-[#070707] text-[#F5F5F0] relative overflow-hidden bg-exhibition-grid box-border flex flex-col items-center justify-center">
      <main className="relative z-10 w-full h-full flex flex-col items-center justify-center overflow-hidden">
        <MemberProfilePage
          member={route.member}
          memberSlug={route.slug}
        />
      </main>
    </div>
  );
}

export function EidCardPage() {
  return (
    <RouterProvider>
      <EidCardContent />
    </RouterProvider>
  );
}
