import React, { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAuth } from '../../auth/hook/useAuth'
import './UserProfile.css'

export default function UserProfile() {
    const user    = useSelector(state => state.auth.user)
    const { handleLogout } = useAuth()
    const [open, setOpen]  = useState(false)
    const popupRef         = useRef(null)

    /* close on outside click */
    useEffect(() => {
        function handleClickOutside(e) {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        if (open) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    const initials = user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'

    return (
        <div className="up-root" ref={popupRef}>

            {/* trigger — avatar + name in sidebar footer */}
            <button className="up-trigger" onClick={() => setOpen(prev => !prev)}>
                <div className="up-avatar">{initials}</div>
                <div className="up-info">
                    <div className="up-name">{user?.name || user?.username || 'User'}</div>
                    <div className="up-role">PREMIUM</div>
                </div>
                <span className="up-chevron">{open ? '▾' : '▸'}</span>
            </button>

            {/* popup */}
            {open && (
                <div className="up-popup">
                    {/* user info header */}
                    <div className="up-popup__head">
                        <div className="up-popup__avatar">{initials}</div>
                        <div>
                            <div className="up-popup__name">{user?.name || user?.username}</div>
                            <div className="up-popup__email">{user?.email}</div>
                        </div>
                    </div>

                    <div className="up-popup__divider" />

                    {/* menu items */}
                    <div className="up-popup__menu">
                        <button className="up-popup__item">
                            <span className="up-popup__item-icon">◎</span>
                            Profile settings
                        </button>
                        <button className="up-popup__item">
                            <span className="up-popup__item-icon">⌘</span>
                            Keyboard shortcuts
                        </button>
                    </div>

                    <div className="up-popup__divider" />

                    {/* logout */}
                    <button
                        className="up-popup__item up-popup__item--danger"
                        onClick={handleLogout}
                    >
                        <span className="up-popup__item-icon">→</span>
                        Log out
                    </button>
                </div>
            )}
        </div>
    )
}
