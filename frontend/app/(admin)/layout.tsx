import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen w-full">
            {/* Admin Header - Higher z-index to ensure dropdowns appear on top */}
            <header className="bg-primary text-white p-4 relative z-40">
                <h1>Admin Panel</h1>
            </header>

            {/* Main Content - full width with right padding for sidebar space */}
            <main className="flex flex-grow w-full pr-2 relative z-20">
                {children}
            </main>

            {/* Admin Footer */}
            <footer className="bg-secondary text-white p-4 text-center relative z-40">
                {/* Footer content */}
            </footer>
        </div>
    );
}


