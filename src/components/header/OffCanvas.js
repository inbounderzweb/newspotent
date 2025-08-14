import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function OffCanvas({ isOpen, onClose, menuItems = [] }) {
  const navigate = useNavigate()
  const location = useLocation()
  const firstLinkRef = useRef(null)

  // Which image is currently shown
  const [currentImage, setCurrentImage] = useState(menuItems[0]?.image || '')

  // When panel opens, reset preview image and focus first item
  useEffect(() => {
    if (isOpen && menuItems.length) {
      setCurrentImage(menuItems[0].image)
      setTimeout(() => firstLinkRef.current?.focus(), 0)
    }
  }, [isOpen, menuItems])

  // Close on ESC
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  const go = (to) => {
    if (!to) return
    navigate(to)
    onClose()
  }

  return (
    <div
      className={`
        fixed inset-0 z-40 mt-12 transition-opacity duration-300
        ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}
      onClick={onClose}
      aria-hidden={!isOpen}
    >
      <div
        className={`
          absolute top-0 right-0 w-80 pr-4 lg:pr-20 bg-white shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
        `}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
      >
        {/* Hero image area */}
        <div className="h-48 overflow-hidden">
          {currentImage ? (
            <img
              src={currentImage}
              alt="Menu preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100" />
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-auto">
          <ul className="divide-y divide-gray-200">
            {menuItems.map((item, idx) => {
              const active =
                item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to || '')
              return (
                <li key={item.to || item.title}>
                  <button
                    type="button"
                    ref={idx === 0 ? firstLinkRef : null}
                    className={`w-full text-left px-6 py-4 text-lg font-medium focus:outline-none
                                ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-800 hover:bg-gray-50'}`}
                    onMouseEnter={() => setCurrentImage(item.image)}
                    onFocus={() => setCurrentImage(item.image)} // a11y
                    onClick={() => go(item.to)}
                  >
                    {item.title}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}

export default OffCanvas
