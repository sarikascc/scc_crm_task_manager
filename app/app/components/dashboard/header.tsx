'use client'

interface HeaderProps {
  pageTitle?: string
  isMobileMenuOpen?: boolean
  onMobileMenuToggle?: () => void
  isSidebarCollapsed?: boolean
  onSidebarToggle?: () => void
}

export function Header({
  pageTitle = 'Dashboard',
  isMobileMenuOpen = false,
  onMobileMenuToggle,
  isSidebarCollapsed = false,
  onSidebarToggle,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Mobile Menu Button & Logo & Collapse Arrow & Page Title */}
        <div className="flex items-center gap-3">
          {onMobileMenuToggle && (
            <button
              onClick={onMobileMenuToggle}
              className="rounded-lg p-2 text-[#1E1B4B] hover:bg-gray-100 transition-colors lg:hidden"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
          
          {/* Logo Section */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#06B6D4] to-[#7C3AED] shadow-sm">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-[#1E1B4B]">CRM Pro</h1>
            
            {/* Collapse Arrow in Header - Only show when sidebar is expanded */}
            {onSidebarToggle && !isSidebarCollapsed && (
              <button
                onClick={onSidebarToggle}
                className="flex items-center justify-center h-7 w-7 rounded-lg hover:bg-gray-100 transition-colors duration-200 ml-1"
                aria-label="Collapse sidebar"
              >
                <svg
                  className="h-4 w-4 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>
          
          <h2 className="text-lg font-semibold text-[#1E1B4B]">{pageTitle}</h2>
        </div>
      </div>
    </header>
  )
}

