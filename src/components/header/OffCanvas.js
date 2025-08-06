import React, { useState, useEffect } from 'react'

function OffCanvas({ isOpen, onClose, menuItems }) {
  // track which image is currently shown
  const [currentImage, setCurrentImage] = useState(menuItems[0].image)

  // if the panel just opened, reset to first image
  useEffect(() => {
    if (isOpen) setCurrentImage(menuItems[0].image)
  }, [isOpen, menuItems])

  // close on ESC
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className={`
        fixed inset-0 z-40 mt-12 transition-opacity duration-300
        ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}
      onClick={onClose}
    >
      <div
        className={`
          absolute top-0 right-0 w-80 pr-4 lg:pr-20 bg-white shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Hero image area */}
        <div className="h-48 overflow-hidden">
          <img
            src={currentImage}
            alt="menu preview"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-auto">
          <ul className="divide-y divide-gray-200">
            {menuItems.map(item => (
              <li key={item.title}>
                <a
                  href={`#${item.title.toLowerCase().replace(/\s+/g, '')}`}
                  className="block px-6 py-4 text-lg font-medium text-gray-800 hover:bg-gray-50"
                  onMouseEnter={() => setCurrentImage(item.image)}
                  onFocus={() => setCurrentImage(item.image)} // a11y
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}

export default OffCanvas
